import PDFDocument from "pdfkit";

const C = {
  dark:    "#112211",
  green:   "#8dd3bb",
  greenDk: "#4a9a7e",
  muted:   "#6B7280",
  border:  "#D7E2EE",
  white:   "#FFFFFF",
  light:   "#F8FAFC",
  amber:   "#F59E0B",
};

const PAGE_W = 595;
const MARGIN = 45;
const INNER  = PAGE_W - MARGIN * 2;

class PdfService {
  // ─── Flight Ticket ──────────────────────────────────────────────────────────
  generateFlightTicket(booking) {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const fb  = booking.flightBooking;
    const { flight } = fb;

    this._drawTicketHeader(doc, "BOARDING PASS", booking.id);

    // ── Route hero ──────────────────────────────────────────────────────────
    const heroY = 130;
    doc.rect(0, heroY, PAGE_W, 110).fill(C.light);

    const dep = flight.departureAirport;
    const arr = flight.arrivalAirport;

    // Left IATA
    doc.fontSize(52).font("Helvetica-Bold").fillColor(C.dark)
      .text(dep.iata, MARGIN, heroY + 18, { width: 160, align: "left" });
    doc.fontSize(10).font("Helvetica").fillColor(C.muted)
      .text(dep.city, MARGIN, heroY + 76, { width: 160 });

    // Dotted line between IATAs (drawn before plane so plane sits on top)
    const lineY = heroY + 46;
    doc.moveTo(MARGIN + 92, lineY)
      .lineTo(PAGE_W - MARGIN - 92, lineY)
      .dash(3, { space: 5 })
      .strokeColor(C.border)
      .lineWidth(1.5)
      .stroke()
      .undash();

    // Plane icon drawn with paths (Helvetica doesn't support ✈ emoji)
    const px = PAGE_W / 2;
    const py = lineY;
    // Body
    doc.moveTo(px - 12, py).lineTo(px + 12, py - 4).lineTo(px + 14, py).lineTo(px + 12, py + 4).closePath().fill(C.green);
    // Left wing
    doc.moveTo(px - 2, py - 1).lineTo(px + 4, py - 9).lineTo(px + 7, py - 8).lineTo(px + 3, py).closePath().fill(C.green);
    // Right wing
    doc.moveTo(px - 2, py + 1).lineTo(px + 4, py + 9).lineTo(px + 7, py + 8).lineTo(px + 3, py).closePath().fill(C.green);

    // Flight number below line
    doc.fontSize(8).font("Helvetica").fillColor(C.muted)
      .text(flight.flightNumber, PAGE_W / 2 - 28, lineY + 10, { width: 56, align: "center" });

    // Right IATA
    doc.fontSize(52).font("Helvetica-Bold").fillColor(C.dark)
      .text(arr.iata, PAGE_W - MARGIN - 160, heroY + 18, { width: 160, align: "right" });
    doc.fontSize(10).font("Helvetica").fillColor(C.muted)
      .text(arr.city, PAGE_W - MARGIN - 160, heroY + 76, { width: 160, align: "right" });

    // ── Tear divider ────────────────────────────────────────────────────────
    this._drawTearLine(doc, 245);

    // ── Info grid row 1 ─────────────────────────────────────────────────────
    const g1Y = 270;
    const cols4 = [MARGIN, MARGIN + 130, MARGIN + 270, MARGIN + 390];
    this._infoBlock(doc, cols4[0], g1Y, "DATE",       this._fmtDate(flight.departureTime));
    this._infoBlock(doc, cols4[1], g1Y, "DEPARTS",    this._fmtTime(flight.departureTime));
    this._infoBlock(doc, cols4[2], g1Y, "ARRIVES",    this._fmtTime(flight.arrivalTime));
    this._infoBlock(doc, cols4[3], g1Y, "DURATION",   this._duration(flight.departureTime, flight.arrivalTime));

    this._drawSoftDivider(doc, 318);

    // ── Info grid row 2 ─────────────────────────────────────────────────────
    const g2Y = 332;
    // Truncate airline name so it fits in 120pt column
    const airlineName = (flight.airline?.name ?? "—").slice(0, 18);
    this._infoBlock(doc, cols4[0], g2Y, "AIRLINE",    airlineName);
    this._infoBlock(doc, cols4[1], g2Y, "CLASS",      this._formatCabin(fb.cabinClass));
    this._infoBlock(doc, cols4[2], g2Y, "PASSENGERS", String(fb.seatCount));
    this._infoBlock(doc, cols4[3], g2Y, "TOTAL",      `$${Number(booking.totalPrice).toFixed(2)}`);

    this._drawSoftDivider(doc, 380);

    // ── Passenger table ─────────────────────────────────────────────────────
    if (fb.passengers?.length) {
      doc.fontSize(8).font("Helvetica-Bold").fillColor(C.muted)
        .text("PASSENGER DETAILS", MARGIN, 390, { characterSpacing: 1 });

      fb.passengers.forEach((p, i) => {
        const rowY = 406 + i * 44;

        // row bg
        doc.roundedRect(MARGIN, rowY, INNER, 36, 4)
          .fill(i % 2 === 0 ? C.light : C.white);

        doc.fontSize(11).font("Helvetica-Bold").fillColor(C.dark)
          .text(`${p.firstName} ${p.lastName}`, MARGIN + 10, rowY + 7, { width: 200 });

        const seat = p.seatNumber ? `Seat ${p.seatNumber}` : "No seat";
        doc.fontSize(9).font("Helvetica-Bold").fillColor(C.green)
          .text(seat, MARGIN + 10, rowY + 22, { width: 100 });

        const pDetails = [
          p.nationality    || null,
          p.passportNumber ? `PP: ${p.passportNumber}` : null,
          p.dateOfBirth    ? `DOB: ${this._fmtDate(p.dateOfBirth)}` : null,
        ].filter(Boolean).join("  ·  ");
        doc.fontSize(9).font("Helvetica").fillColor(C.muted)
          .text(pDetails || "Passenger", MARGIN + 220, rowY + 14, { width: 300 });
      });
    }

    // ── Barcode strip ────────────────────────────────────────────────────────
    const bcY = doc.page.height - 100;
    this._drawBarcodeStrip(doc, bcY, booking.id, `${dep.iata}→${arr.iata}`);

    this._drawTicketFooter(doc);
    doc.end();
    return doc;
  }

  // ─── Hotel Voucher ──────────────────────────────────────────────────────────
  generateHotelVoucher(booking) {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const hb  = booking.hotelBooking;
    const { hotel } = hb.room;
    const nights = Math.ceil(
      (new Date(hb.checkOut) - new Date(hb.checkIn)) / (1000 * 60 * 60 * 24),
    );

    this._drawTicketHeader(doc, "HOTEL VOUCHER", booking.id);

    // ── Hotel hero ──────────────────────────────────────────────────────────
    doc.rect(0, 130, PAGE_W, 100).fill(C.light);

    doc.fontSize(26).font("Helvetica-Bold").fillColor(C.dark)
      .text(hotel.name, MARGIN, 145, { width: INNER });

    doc.fontSize(10).font("Helvetica").fillColor(C.muted)
      .text(`${hotel.address}, ${hotel.city}, ${hotel.country}`, MARGIN, 180, { width: INNER });

    // Stars — drawn as filled/empty polygons (Helvetica doesn't support ★/☆)
    this._drawStars(doc, MARGIN, 198, hotel.stars, 5);

    this._drawTearLine(doc, 238);

    const cols4 = [MARGIN, MARGIN + 130, MARGIN + 270, MARGIN + 390];

    const g1Y = 258;
    this._infoBlock(doc, cols4[0], g1Y, "CHECK-IN",  this._fmtDate(hb.checkIn));
    this._infoBlock(doc, cols4[1], g1Y, "CHECK-OUT", this._fmtDate(hb.checkOut));
    this._infoBlock(doc, cols4[2], g1Y, "NIGHTS",    String(nights));
    this._infoBlock(doc, cols4[3], g1Y, "GUESTS",    String(hb.guestCount));

    this._drawSoftDivider(doc, 306);

    const g2Y = 320;
    this._infoBlock(doc, cols4[0], g2Y, "ROOM TYPE", hb.room.type);
    this._infoBlock(doc, cols4[1], g2Y, "ROOM №",    hb.room.roomNumber);
    this._infoBlock(doc, cols4[2], g2Y, "TOTAL",     `$${Number(booking.totalPrice).toFixed(2)}`);
    this._infoBlock(doc, cols4[3], g2Y, "STATUS",    booking.payment?.status ?? "CONFIRMED");

    this._drawSoftDivider(doc, 368);

    if (hb.guests?.length) {
      doc.fontSize(8).font("Helvetica-Bold").fillColor(C.muted)
        .text("GUEST DETAILS", MARGIN, 378, { characterSpacing: 1 });

      hb.guests.forEach((g, i) => {
        const rowY = 394 + i * 44;
        doc.roundedRect(MARGIN, rowY, INNER, 36, 4)
          .fill(i % 2 === 0 ? C.light : C.white);

        doc.fontSize(11).font("Helvetica-Bold").fillColor(C.dark)
          .text(`${g.firstName} ${g.lastName}`, MARGIN + 10, rowY + 7, { width: 240 });

        // Only show passport / nationality when they are actually set
        const details = [
          g.nationality   || null,
          g.passportNumber ? `PP: ${g.passportNumber}` : null,
          g.dateOfBirth    ? `DOB: ${this._fmtDate(g.dateOfBirth)}` : null,
        ].filter(Boolean).join("  ·  ");

        if (details) {
          doc.fontSize(9).font("Helvetica").fillColor(C.muted)
            .text(details, MARGIN + 10, rowY + 22, { width: 300 });
        } else {
          doc.fontSize(9).font("Helvetica").fillColor(C.muted)
            .text("Hotel guest", MARGIN + 10, rowY + 22, { width: 300 });
        }
      });
    }

    const bcY = doc.page.height - 100;
    this._drawBarcodeStrip(doc, bcY, booking.id, hotel.name.slice(0, 20).toUpperCase());

    this._drawTicketFooter(doc);
    doc.end();
    return doc;
  }

  // ─── Shared drawing helpers ─────────────────────────────────────────────────

  _drawTicketHeader(doc, subtitle, bookingId) {
    // Dark header background
    doc.rect(0, 0, PAGE_W, 120).fill(C.dark);

    // Green accent strip on left
    doc.rect(0, 0, 6, 120).fill(C.green);

    // Golobe wordmark
    doc.fontSize(28).font("Helvetica-Bold").fillColor(C.white)
      .text("Golobe", MARGIN, 28);

    // Green dot after logo
    doc.circle(MARGIN + 88, 38, 4).fill(C.green);

    // Subtitle
    doc.fontSize(9).font("Helvetica").fillColor(C.green)
      .text(subtitle, MARGIN, 66, { characterSpacing: 2 });

    // Booking info right side
    doc.fontSize(8).font("Helvetica").fillColor("#AABBC8")
      .text(`Booking #${bookingId.slice(0, 8).toUpperCase()}`, PAGE_W - MARGIN - 160, 32,
            { width: 160, align: "right" })
      .text(`Issued: ${new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`,
            PAGE_W - MARGIN - 160, 46, { width: 160, align: "right" });
  }

  _drawTearLine(doc, y) {
    // Side notch circles (cut into the page edge)
    doc.circle(-8, y, 10).fill(C.border);
    doc.circle(PAGE_W + 8, y, 10).fill(C.border);

    // Dashed perforation line
    doc.moveTo(14, y).lineTo(PAGE_W - 14, y)
      .dash(5, { space: 5 })
      .strokeColor(C.border)
      .lineWidth(1)
      .stroke()
      .undash();
  }

  _drawSoftDivider(doc, y) {
    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y)
      .strokeColor(C.border)
      .lineWidth(0.5)
      .stroke();
  }

  _drawBarcodeStrip(doc, y, bookingId, label) {
    // Background
    doc.rect(0, y, PAGE_W, 80).fill(C.dark);
    doc.rect(0, y, 6, 80).fill(C.green);

    // Simulated barcode bars
    const barX = MARGIN;
    const barH  = 44;
    const barY  = y + 18;
    const widths = [2,1,3,1,2,1,1,3,2,1,2,3,1,2,1,3,2,1,1,2,3,1,2,1,2,1,3,2,1,3,1,2,1,1,2,3];
    let cx = barX;
    widths.forEach((w, i) => {
      if (i % 2 === 0) {
        doc.rect(cx, barY, w, barH).fill(C.white);
      }
      cx += w + 1;
    });

    // Booking ID below bars
    doc.fontSize(7).font("Helvetica").fillColor("#AABBC8")
      .text(bookingId.toUpperCase(), barX, barY + barH + 4, { width: 200 });

    // Route/hotel label right
    doc.fontSize(14).font("Helvetica-Bold").fillColor(C.white)
      .text(label, PAGE_W - MARGIN - 200, y + 22, { width: 200, align: "right" });

    doc.fontSize(8).font("Helvetica").fillColor(C.green)
      .text("golobe.travel", PAGE_W - MARGIN - 200, y + 46, { width: 200, align: "right" });
  }

  _drawTicketFooter(doc) {
    // Green bottom bar
    doc.rect(0, doc.page.height - 18, PAGE_W, 18).fill(C.green);

    doc.fontSize(7).font("Helvetica").fillColor(C.dark)
      .text("This document is your official booking confirmation. Present at check-in. © 2026 Golobe",
            MARGIN, doc.page.height - 13, { width: INNER, align: "center" });
  }

  // Draw N filled + (total-N) empty 5-point stars using polygon paths
  _drawStars(doc, x, y, filled, total, size = 9) {
    const step  = size * 2.6;
    const outer = size;
    const inner = size * 0.4;
    const pts   = 5;

    for (let s = 0; s < total; s++) {
      const cx = x + s * step + outer;
      const cy = y + outer;
      const isFilled = s < filled;
      const path = [];

      for (let i = 0; i < pts * 2; i++) {
        const r     = i % 2 === 0 ? outer : inner;
        const angle = (Math.PI / pts) * i - Math.PI / 2;
        const px    = cx + r * Math.cos(angle);
        const py    = cy + r * Math.sin(angle);
        path.push(i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`);
      }
      path.push("Z");

      if (isFilled) {
        doc.path(path.join(" ")).fill(C.amber);
      } else {
        doc.path(path.join(" ")).strokeColor(C.border).lineWidth(0.8).stroke();
      }
    }
  }

  _infoBlock(doc, x, y, label, value) {
    doc.fontSize(7).font("Helvetica").fillColor(C.muted)
      .text(label, x, y, { width: 120, characterSpacing: 0.8 });
    doc.fontSize(13).font("Helvetica-Bold").fillColor(C.dark)
      .text(value ?? "—", x, y + 12, { width: 120 });
  }

  _fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  _fmtTime(iso) {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  _duration(dep, arr) {
    const mins = Math.round((new Date(arr) - new Date(dep)) / 60000);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  _formatCabin(cabin) {
    const map = { ECONOMY: "Economy", PREMIUM_ECONOMY: "Prem. Economy", BUSINESS: "Business", FIRST: "First Class" };
    return map[cabin] ?? cabin;
  }

  toBuffer(doc) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end",  () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });
  }
}

export default new PdfService();
