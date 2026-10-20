import "server-only";

import {
  markFormEnquiryEmailSent,
  persistFormEnquiry,
  type FormEnquiryKind,
} from "@/lib/form-enquiry-store";
import { isEmailTransportConfigured } from "@/lib/mailer";

export class FormEnquiryDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormEnquiryDeliveryError";
  }
}

/**
 * Saves the enquiry to Postgres, then attempts email. Succeeds when either
 * persistence or email works so public forms stay usable during SMTP outages.
 */
export async function deliverFormEnquiry(options: {
  kind: FormEnquiryKind;
  payload: Record<string, unknown>;
  sendEmail: () => Promise<void>;
}): Promise<{ stored: boolean; emailSent: boolean }> {
  let enquiryId: string | null = null;

  try {
    enquiryId = await persistFormEnquiry(options.kind, options.payload);
  } catch (error) {
    console.error(`[${options.kind}] failed to persist enquiry:`, error);
  }

  if (!isEmailTransportConfigured()) {
    if (enquiryId) {
      return { stored: true, emailSent: false };
    }

    throw new FormEnquiryDeliveryError(
      "Enquiry storage is unavailable and email is not configured.",
    );
  }

  try {
    await options.sendEmail();
    if (enquiryId) {
      await markFormEnquiryEmailSent(enquiryId);
    }
    return { stored: Boolean(enquiryId), emailSent: true };
  } catch (error) {
    console.error(`[${options.kind}] email delivery failed:`, error);
    if (enquiryId) {
      return { stored: true, emailSent: false };
    }
    throw new FormEnquiryDeliveryError(
      "Unable to send your message right now. Please try again later.",
    );
  }
}
