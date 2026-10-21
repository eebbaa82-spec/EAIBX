import type { Metadata } from "next";
import { VerifyCertificate } from "@/components/academy/Verify";
import { PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Verify a Certificate · Investopia Academy",
  description: "Check that an Investopia Academy certificate is genuine by its certificate number or QR code.",
};

export default function VerifyPage() {
  return (
    <>
      <PageHero
        eyebrow="Investopia Academy"
        title="Verify a certificate"
        subhead="Every Investopia Academy certificate carries a unique number and a QR code. Scan the code, or enter the number below, to confirm the certificate is genuine."
      />
      <Section title="Certificate check">
        <VerifyCertificate />
      </Section>
    </>
  );
}
