import { getArtworkTitle } from "@/lib/catalog";
import { formatEmailList, getContactEmails } from "@/lib/emails";
import { getSiteConfig } from "@/lib/site-data";
import { formatPrice } from "@/types/artwork";
import nodemailer from "nodemailer";

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

function createTransporter() {
  const emailServer = process.env.EMAIL_SERVER?.trim();
  if (emailServer) {
    return nodemailer.createTransport(emailServer);
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Email is not configured. Set EMAIL_SERVER (NextAuth) or SMTP_HOST, SMTP_USER, and SMTP_PASS.",
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

function resolveMailFrom(siteName: string, primaryContactEmail: string): string {
  const explicit =
    process.env.SMTP_FROM?.trim() || process.env.EMAIL_FROM?.trim();
  if (explicit) {
    return explicit;
  }

  const email = primaryContactEmail.trim();
  const displayName = siteName.trim().replace(/"/g, "'");
  return `"${displayName}" <${email}>`;
}

export function isEmailTransportConfigured(): boolean {
  if (process.env.EMAIL_SERVER?.trim()) {
    return true;
  }

  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );
}

async function buildOrderEmailHtml(payload: NewOrderEmailPayload) {
  const itemRows = await Promise.all(
    payload.items.map(async (item) => {
      const lineTotal = item.price * item.quantity;
      const title = await getArtworkTitle(item.artworkId);

      return `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${title}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.size}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(lineTotal)}</td>
        </tr>
      `;
    }),
  );

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
        <tbody>${itemRows.join("")}</tbody>
      </table>
    </div>
  `;
}

export async function sendNewOrderConfirmedEmail(
  payload: NewOrderEmailPayload,
): Promise<void> {
  const transporter = createTransporter();
  const [contactEmails, config] = await Promise.all([
    getContactEmails(),
    getSiteConfig(),
  ]);
  const primaryContactEmail = contactEmails[0] ?? config.contactEmail;
  const from = resolveMailFrom(config.siteName, primaryContactEmail);
  const textLines = await Promise.all(
    payload.items.map(async (item) => {
      const title = await getArtworkTitle(item.artworkId);
      return `- ${title} (${item.size}) x${item.quantity}: ${formatPrice(item.price * item.quantity)}`;
    }),
  );

  await transporter.sendMail({
    from,
    to: formatEmailList(contactEmails),
    subject: `New Order Confirmed — ${payload.orderId.slice(-8).toUpperCase()}`,
    html: await buildOrderEmailHtml(payload),
    text: [
      "New Order Confirmed",
      `Order ID: ${payload.orderId}`,
      `Buyer: ${payload.buyerEmail}`,
      `Total: ${formatPrice(payload.totalAmount)}`,
      "",
      ...textLines,
    ].join("\n"),
  });
}

export interface ContactEmailPayload {
  name: string;
  email?: string;
  mobile: string;
  location: string;
  spaceType?: string;
  subject: string;
  message: string;
  wallPhotoUrl?: string;
  wallPhotoAttachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
}

export async function sendContactFormEmail(
  payload: ContactEmailPayload,
): Promise<void> {
  const transporter = createTransporter();
  const [contactEmails, config] = await Promise.all([
    getContactEmails(),
    getSiteConfig(),
  ]);
  const primaryContactEmail = contactEmails[0] ?? config.contactEmail;
  // FROM should be the studio mailbox (SMTP_FROM / contact), not the admin login email.
  const from = resolveMailFrom(config.siteName, primaryContactEmail);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "")
    .trim()
    .replace(/\/$/, "");

  const safeName = escapeHtml(payload.name);
  const emailLine = payload.email?.trim() ?? "";
  const safeEmail = emailLine ? escapeHtml(emailLine) : "Not provided";
  const safeMobile = escapeHtml(payload.mobile);
  const safeLocation = escapeHtml(payload.location);
  const spaceTypeLine = payload.spaceType?.trim() ?? "";
  const safeSpaceType = spaceTypeLine ? escapeHtml(spaceTypeLine) : "Not provided";
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message);
  const photoLink =
    payload.wallPhotoUrl && appUrl
      ? `${appUrl}${payload.wallPhotoUrl.startsWith("/") ? "" : "/"}${payload.wallPhotoUrl}`
      : payload.wallPhotoUrl ?? "";

  await transporter.sendMail({
    from,
    to: formatEmailList(contactEmails),
    ...(emailLine ? { replyTo: emailLine } : {}),
    subject: `[Contact] ${payload.subject}`,
    attachments: payload.wallPhotoAttachment
      ? [
          {
            filename: payload.wallPhotoAttachment.filename,
            content: payload.wallPhotoAttachment.content,
            contentType: payload.wallPhotoAttachment.contentType,
          },
        ]
      : undefined,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #171717; line-height: 1.6;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280;">New Contact Enquiry</p>
        <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 16px;">${safeSubject}</h1>
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 8px;"><strong>Mobile:</strong> ${safeMobile}</p>
        <p style="margin: 0 0 8px;"><strong>Location:</strong> ${safeLocation}</p>
        <p style="margin: 0 0 8px;"><strong>Space / project type:</strong> ${safeSpaceType}</p>
        ${photoLink ? `<p style="margin: 0 0 24px;"><strong>Wall photo:</strong> <a href="${escapeHtml(photoLink)}">${escapeHtml(photoLink)}</a></p>` : `<p style="margin: 0 0 24px;"></p>`}
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Message</p>
        <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
      </div>
    `,
    text: [
      "New Contact Enquiry",
      `Name: ${payload.name}`,
      `Email: ${emailLine || "Not provided"}`,
      `Mobile: ${payload.mobile}`,
      `Location: ${payload.location}`,
      `Space / project type: ${spaceTypeLine || "Not provided"}`,
      photoLink ? `Wall photo: ${photoLink}` : "",
      `Subject: ${payload.subject}`,
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export interface TradeEnquiryEmailPayload {
  name: string;
  email?: string;
  mobile: string;
  company?: string;
  projectType?: string;
  subject: string;
  message: string;
}

export interface PortfolioDownloadEnquiryEmailPayload {
  name: string;
  email: string;
  mobile: string;
  location: string;
}

export async function sendPortfolioDownloadEnquiryEmail(
  payload: PortfolioDownloadEnquiryEmailPayload,
): Promise<void> {
  const transporter = createTransporter();
  const [contactEmails, config] = await Promise.all([
    getContactEmails(),
    getSiteConfig(),
  ]);
  const primaryContactEmail = contactEmails[0] ?? config.contactEmail;
  const from = resolveMailFrom(config.siteName, primaryContactEmail);
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeMobile = escapeHtml(payload.mobile);
  const safeLocation = escapeHtml(payload.location);

  await transporter.sendMail({
    from,
    to: formatEmailList(contactEmails),
    replyTo: payload.email,
    subject: "[Portfolio Download] Designer portfolio access",
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #171717; line-height: 1.6;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280;">Portfolio download</p>
        <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 16px;">Designer requested the portfolio PDF</h1>
        <p style="margin: 0 0 8px;"><strong>Name or organisation:</strong> ${safeName}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 8px;"><strong>Mobile:</strong> ${safeMobile}</p>
        <p style="margin: 0 0 8px;"><strong>Location:</strong> ${safeLocation}</p>
      </div>
    `,
    text: [
      "Portfolio download — designer details",
      `Name or organisation: ${payload.name}`,
      `Email: ${payload.email}`,
      `Mobile: ${payload.mobile}`,
      `Location: ${payload.location}`,
    ].join("\n"),
  });
}

export async function sendTradeEnquiryEmail(
  payload: TradeEnquiryEmailPayload,
): Promise<void> {
  const transporter = createTransporter();
  const [contactEmails, config] = await Promise.all([
    getContactEmails(),
    getSiteConfig(),
  ]);
  const primaryContactEmail = contactEmails[0] ?? config.contactEmail;
  // FROM should be the studio mailbox (SMTP_FROM / contact), not the admin login email.
  const from = resolveMailFrom(config.siteName, primaryContactEmail);
  const safeName = escapeHtml(payload.name);
  const emailLine = payload.email?.trim() ?? "";
  const safeEmail = emailLine ? escapeHtml(emailLine) : "Not provided";
  const safeMobile = escapeHtml(payload.mobile);
  const safeCompany = escapeHtml(payload.company ?? "");
  const projectTypeLine = payload.projectType?.trim() ?? "";
  const safeProjectType = projectTypeLine ? escapeHtml(projectTypeLine) : "Not provided";
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message);

  await transporter.sendMail({
    from,
    to: formatEmailList(contactEmails),
    ...(emailLine ? { replyTo: emailLine } : {}),
    subject: `[Trade Enquiry] ${payload.subject}`,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #171717; line-height: 1.6;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280;">For Interior Designers</p>
        <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 16px;">${safeSubject}</h1>
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 8px;"><strong>Mobile:</strong> ${safeMobile}</p>
        ${safeCompany ? `<p style="margin: 0 0 8px;"><strong>Company / Studio:</strong> ${safeCompany}</p>` : ""}
        <p style="margin: 0 0 24px;"><strong>Space / project type:</strong> ${safeProjectType}</p>
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Project notes</p>
        <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
      </div>
    `,
    text: [
      "For Interior Designers — Trade Enquiry",
      `Name: ${payload.name}`,
      `Email: ${emailLine || "Not provided"}`,
      `Mobile: ${payload.mobile}`,
      payload.company ? `Company / Studio: ${payload.company}` : "",
      `Space / project type: ${projectTypeLine || "Not provided"}`,
      `Subject: ${payload.subject}`,
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export interface SignatureEnquiryEmailPayload {
  name: string;
  email?: string;
  mobile: string;
  location: string;
  spaceType?: string;
  subject: string;
  message: string;
  projectTitle?: string;
  wallPhotoUrl?: string;
  wallPhotoAttachment?: {
    filename: string;
    content: Buffer;
    contentType: string;
  };
}

export async function sendSignatureEnquiryEmail(
  payload: SignatureEnquiryEmailPayload,
): Promise<void> {
  const transporter = createTransporter();
  const [contactEmails, config] = await Promise.all([
    getContactEmails(),
    getSiteConfig(),
  ]);
  const primaryContactEmail = contactEmails[0] ?? config.contactEmail;
  const from = resolveMailFrom(config.siteName, primaryContactEmail);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "")
    .trim()
    .replace(/\/$/, "");

  const safeName = escapeHtml(payload.name);
  const emailLine = payload.email?.trim() ?? "";
  const safeEmail = emailLine ? escapeHtml(emailLine) : "Not provided";
  const safeMobile = escapeHtml(payload.mobile);
  const safeLocation = escapeHtml(payload.location);
  const spaceTypeLine = payload.spaceType?.trim() ?? "";
  const safeSpaceType = spaceTypeLine ? escapeHtml(spaceTypeLine) : "Not provided";
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message);
  const safeProject = escapeHtml(payload.projectTitle ?? "");
  const photoLink =
    payload.wallPhotoUrl && appUrl
      ? `${appUrl}${payload.wallPhotoUrl.startsWith("/") ? "" : "/"}${payload.wallPhotoUrl}`
      : payload.wallPhotoUrl ?? "";

  await transporter.sendMail({
    from,
    to: formatEmailList(contactEmails),
    ...(emailLine ? { replyTo: emailLine } : {}),
    subject: `[Signature Wall] ${payload.subject}`,
    attachments: payload.wallPhotoAttachment
      ? [
          {
            filename: payload.wallPhotoAttachment.filename,
            content: payload.wallPhotoAttachment.content,
            contentType: payload.wallPhotoAttachment.contentType,
          },
        ]
      : undefined,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #171717; line-height: 1.6;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280;">Signature Wall Art Enquiry</p>
        <h1 style="font-size: 24px; font-weight: 500; margin: 0 0 16px;">${safeSubject}</h1>
        ${safeProject ? `<p style="margin: 0 0 8px;"><strong>Project:</strong> ${safeProject}</p>` : ""}
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin: 0 0 8px;"><strong>Mobile:</strong> ${safeMobile}</p>
        <p style="margin: 0 0 8px;"><strong>Location:</strong> ${safeLocation}</p>
        <p style="margin: 0 0 8px;"><strong>Space / project type:</strong> ${safeSpaceType}</p>
        ${photoLink ? `<p style="margin: 0 0 24px;"><strong>Wall photo:</strong> <a href="${escapeHtml(photoLink)}">${escapeHtml(photoLink)}</a></p>` : `<p style="margin: 0 0 24px;"></p>`}
        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">Message</p>
        <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
      </div>
    `,
    text: [
      "Signature Wall Art Enquiry",
      payload.projectTitle ? `Project: ${payload.projectTitle}` : "",
      `Name: ${payload.name}`,
      `Email: ${emailLine || "Not provided"}`,
      `Mobile: ${payload.mobile}`,
      `Location: ${payload.location}`,
      `Space / project type: ${spaceTypeLine || "Not provided"}`,
      photoLink ? `Wall photo: ${photoLink}` : "",
      `Subject: ${payload.subject}`,
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
