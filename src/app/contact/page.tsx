import { ContactPageContent } from "./ContactPageContent";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Reach the studio for acquisitions, commissions, and private viewings.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
