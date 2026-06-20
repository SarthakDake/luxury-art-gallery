import config from "@/data/config.json";
import artworks from "@/data/artworks.json";
import type { Artwork } from "@/types/artwork";
import { formatPrice } from "@/types/artwork";
import nodemailer from "nodemailer";

const artworkCatalog = artworks as Artwork[];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface OrderEmailItem {
  artworkId: string;
  size: string;
  price: number;
  quantity: number;
}

export interface NewOrderEmailPayload {
  orderId: string;
  buyerEmail: string;
  buyerName?: string | null;
  totalAmount: number;
  createdAt: Date;
  items: OrderEmailItem[];
}

function getArtworkTitle(artworkId: string) {
  return (
    artworkCatalog.find((artwork) => artwork.id === artworkId)?.title ?? artworkId
  );
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.",
    );
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function buildOrderEmailHtml(payload: NewOrderEmailPayload) {
  const itemRows = payload.items
    .map((item) => {
      const lineTotal = item.price * item.quantity;

      return `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${getArtworkTitle(item.artworkId)}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.size}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #171717; line-height: 1.6;">
      <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280;">New Order Confirmed</p>
      <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 16px;">Payment received for order ${escapeHtml(payload.orderId.slice(-8).toUpperCase())}</h1>
      <p style="margin: 0 0 24px;">A collector has completed checkout. Review the details below in your admin dashboard.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tbody>
          <tr><td style="padding: 4px 0; color: #6b7280;">Buyer</td><td style="padding: 4px 0; text-align: right;">${payload.buyerName ? `${escapeHtml(payload.buyerName)} (${escapeHtml(payload.buyerEmail)})` : escapeHtml(payload.buyerEmail)}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Order ID</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(payload.orderId)}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Placed</td><td style="padding: 4px 0; text-align: right;">${payload.createdAt.toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding: 4px 0; color: #6b7280;">Total</td><td style="padding: 4px 0; text-align: right; font-weight: 600;">${formatPrice(payload.totalAmount)}</td></tr>
        </tbody>
      </table>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">Work</th>
            <th style="text-align: left; padding-bottom: 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">Size</th>
            <th style="text-align: left; padding-bottom: 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">Qty</th>
            <th style="text-align: right; padding-bottom: 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
  `;
}

export async function sendNewOrderConfirmedEmail(
  payload: NewOrderEmailPayload,
): Promise<void> {
  const transporter = createTransporter();
  const from =
    process.env.SMTP_FROM ??
    `${config.siteName} <${process.env.SMTP_USER ?? config.contactEmail}>`;

  await transporter.sendMail({
    from,
    to: config.contactEmail,
    subject: `New Order Confirmed — ${payload.orderId.slice(-8).toUpperCase()}`,
    html: buildOrderEmailHtml(payload),
    text: [
      "New Order Confirmed",
      `Order ID: ${payload.orderId}`,
      `Buyer: ${payload.buyerEmail}`,
      `Total: ${formatPrice(payload.totalAmount)}`,
      "",
      ...payload.items.map(
        (item) =>
          `- ${getArtworkTitle(item.artworkId)} (${item.size}) x${item.quantity}: ${formatPrice(item.price * item.quantity)}`,
      ),
    ].join("\n"),
  });
}

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactFormEmail(
  payload: ContactEmailPayload,
): Promise<void> {
  const transporter = createTransporter();
  const from =
    process.env.SMTP_FROM ??
    `${config.siteName} <${process.env.SMTP_USER ?? config.contactEmail}>`;
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message);

  await transporter.sendMail({
    from,
    to: config.contactEmail,
    replyTo: payload.email,
    subject: `[Contact] ${payload.subject}`,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #171717; line-height: 1.6;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280;">New Contact Inquiry</p>
        <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 16px;">${safeSubject}</h1>
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 24px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Message</p>
        <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
      </div>
    `,
    text: [
      "New Contact Inquiry",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      "",
      payload.message,
    ].join("\n"),
  });
}
