import nodemailer from "nodemailer";
import {
  getActivationTemplate,
  getEmailChangeTemplate,
} from "../templates/email-templates.js";

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      /* host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT, */
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
      text: "",
      html: getActivationTemplate(link),
    });
  }

  async sendEmailChangeMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Email change request on " + process.env.API_URL,
      text: "",
      html: getEmailChangeTemplate(link),
    });
  }
}

export default new MailService();
