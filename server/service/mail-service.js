import nodemailer from "nodemailer";
import {
  getActivationTemplate,
  getEmailChangeTemplate,
  getBookingConfirmationTemplate,
} from "../templates/email-templates.js";

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Account activation on " + process.env.API_URL,
      html: getActivationTemplate(link),
    });
  }

  async sendEmailChangeMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Email change request on " + process.env.API_URL,
      html: getEmailChangeTemplate(link),
    });
  }

  // ─── Booking confirmation email (with optional PDF attachment) ───────────────
  async sendBookingConfirmation(to, { bookingId, type, details, totalPrice, currency }, pdfBuffer = null) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: `Booking Confirmed — ${type === "FLIGHT" ? "Flight Ticket" : "Hotel Reservation"} | Golobe`,
      html: getBookingConfirmationTemplate({ bookingId, type, details, totalPrice, currency }),
    };

    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: `golobe-ticket-${bookingId.slice(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ];
    }

    await this.transporter.sendMail(mailOptions);
  }
}

export default new MailService();
