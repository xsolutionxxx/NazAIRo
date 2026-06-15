import PDFDocument from "pdfkit";

class PdfService {
  // ─── Flight Ticket ──────────────────────────────────────────────────────────
  generateFlightTicket(booking) {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const fb = booking.flightBooking;
    const { flight } = fb;

    this._drawHeader(doc, "BOARDING PASS", booking.id);
    this._drawDivider(doc);

    // Route hero
    const routeY = doc.y + 10;
    doc.fontSize(36).font("Helvetica-Bold")
      .fillColor("#112211")
      .text(flight.departureAirport.iata, 50, routeY, { continued: false });

    doc.fontSize(18).font("Helvetica")
      .fillColor("#8dd3bb")
      .text("→", 50 + 80, routeY + 10);

    doc.fontSize(36).font("Helvetica-Bold")
      .fillColor("#112211")
      .text(flight.arrivalAirport.iata, 50 + 130, routeY);

    // City names below
    doc.fontSize(11).font("Helvetica").fillColor("#79747E")
      .text(flight.departureAirport.city, 50, routeY + 42)
      .text(flight.arrivalAirport.city,   50 + 130, routeY + 42);

    doc.moveDown(3.5);
    this._drawDivider(doc);

    // Flight info grid
    const infoY = doc.y + 14;
    const cols = [50, 180, 310, 440];

    this._infoBlock(doc, cols[0], infoY, "FLIGHT",     flight.flightNumber);
    this._infoBlock(doc, cols[1], infoY, "AIRLINE",    flight.airline.name);
    this._infoBlock(doc, cols[2], infoY, "CLASS",      this._formatCabin(fb.cabinClass));
    this._infoBlock(doc, cols[3], infoY, "PASSENGERS", String(fb.seatCount));

    doc.moveDown(4);
    this._drawDivider(doc);

    // Times
    const timesY = doc.y + 14;
    this._infoBlock(doc, cols[0], timesY, "DATE",       this._fmtDate(flight.departureTime));
    this._infoBlock(doc, cols[1], timesY, "DEPARTS",    this._fmtTime(flight.departureTime));
    this._infoBlock(doc, cols[2], timesY, "ARRIVES",    this._fmtTime(flight.arrivalTime));
    this._infoBlock(doc, cols[3], timesY, "DURATION",   this._duration(flight.departureTime, flight.arrivalTime));

    doc.moveDown(4);
    this._drawDivider(doc);

    // Passengers table
    if (fb.passengers?.length) {
      doc.moveDown(0.8);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#79747E")
        .text("PASSENGER DETAILS", 50);
      doc.moveDown(0.5);

      fb.passengers.forEach((p, i) => {
        const pY = doc.y;
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#112211")
          .text(`${i + 1}. ${p.firstName} ${p.lastName}`, 50, pY);
        doc.fontSize(10).font("Helvetica").fillColor("#79747E")
          .text(`Passport: ${p.passportNumber}  |  Nationality: ${p.nationality}  |  DOB: ${this._fmtDate(p.dateOfBirth)}`, 50);
        doc.moveDown(0.3);
      });
    }

    this._drawDivider(doc);
    this._drawFooter(doc, booking);
    doc.end();
    return doc;
  }

  // ─── Hotel Voucher ──────────────────────────────────────────────────────────
  generateHotelVoucher(booking) {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const hb = booking.hotelBooking;
    const { hotel } = hb.room;
    const nights = Math.ceil(
      (new Date(hb.checkOut) - new Date(hb.checkIn)) / (1000 * 60 * 60 * 24),
    );

    this._drawHeader(doc, "HOTEL VOUCHER", booking.id);
    this._drawDivider(doc);

    // Hotel name
    doc.moveDown(0.5);
    doc.fontSize(26).font("Helvetica-Bold").fillColor("#112211")
      .text(hotel.name, 50);
    doc.fontSize(12).font("Helvetica").fillColor("#79747E")
      .text(`${hotel.address}, ${hotel.city}, ${hotel.country}`, 50);

    // Stars
    const stars = "★".repeat(hotel.stars) + "☆".repeat(5 - hotel.stars);
    doc.fontSize(14).fillColor("#f59e0b").text(stars, 50);

    doc.moveDown(1);
    this._drawDivider(doc);

    // Stay info grid
    const infoY = doc.y + 14;
    const cols  = [50, 180, 310, 440];

    this._infoBlock(doc, cols[0], infoY, "ROOM TYPE",  hb.room.type);
    this._infoBlock(doc, cols[1], infoY, "ROOM №",     hb.room.roomNumber);
    this._infoBlock(doc, cols[2], infoY, "GUESTS",     String(hb.guestCount));
    this._infoBlock(doc, cols[3], infoY, "NIGHTS",     String(nights));

    doc.moveDown(4);
    this._drawDivider(doc);

    const datesY = doc.y + 14;
    this._infoBlock(doc, cols[0], datesY, "CHECK-IN",  this._fmtDate(hb.checkIn));
    this._infoBlock(doc, cols[1], datesY, "CHECK-OUT", this._fmtDate(hb.checkOut));
    this._infoBlock(doc, cols[2], datesY, "TOTAL",     `$${Number(booking.totalPrice).toFixed(2)}`);
    this._infoBlock(doc, cols[3], datesY, "STATUS",    booking.payment?.status ?? "—");

    doc.moveDown(4);
    this._drawDivider(doc);

    // Guests
    if (hb.guests?.length) {
      doc.moveDown(0.8);
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#79747E")
        .text("GUEST DETAILS", 50);
      doc.moveDown(0.5);

      hb.guests.forEach((g, i) => {
        doc.fontSize(11).font("Helvetica-Bold").fillColor("#112211")
          .text(`${i + 1}. ${g.firstName} ${g.lastName}`, 50);
        doc.fontSize(10).font("Helvetica").fillColor("#79747E")
          .text(`Passport: ${g.passportNumber}  |  Nationality: ${g.nationality}`, 50);
        doc.moveDown(0.3);
      });
    }

    this._drawDivider(doc);
    this._drawFooter(doc, booking);
    doc.end();
    return doc;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _drawHeader(doc, title, bookingId) {
    // Green accent bar
    doc.rect(0, 0, 595, 8).fill("#8dd3bb");

    doc.moveDown(0.5);
    doc.fontSize(22).font("Helvetica-Bold").fillColor("#112211")
      .text("NazAIRo", 50, 28);

    doc.fontSize(11).font("Helvetica").fillColor("#8dd3bb")
      .text(title, 50, 55);

    doc.fontSize(9).font("Helvetica").fillColor("#79747E")
      .text(`Booking #${bookingId.slice(0, 8).toUpperCase()}`, 400, 30, { align: "right", width: 145 })
      .text(`Generated: ${new Date().toLocaleString("en-GB")}`, 400, 44, { align: "right", width: 145 });

    doc.moveDown(2);
  }

  _drawDivider(doc) {
    doc.moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor("#D7E2EE")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.3);
  }

  _drawFooter(doc, booking) {
    doc.moveDown(1);
    doc.fontSize(9).font("Helvetica").fillColor("#79747E")
      .text("This document serves as your official booking confirmation.", 50, doc.y, { align: "center", width: 495 })
      .text("Please present this voucher at check-in. NazAIRo © 2026", { align: "center", width: 495 });

    // Bottom bar
    doc.rect(0, doc.page.height - 8, 595, 8).fill("#8dd3bb");
  }

  _infoBlock(doc, x, y, label, value) {
    doc.fontSize(8).font("Helvetica").fillColor("#79747E")
      .text(label, x, y, { width: 120 });
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#112211")
      .text(value, x, y + 14, { width: 120 });
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
}

export default new PdfService();
