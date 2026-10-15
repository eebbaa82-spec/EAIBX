import { LegalPage, legalMetadata } from "@/components/group-c/legal";

export const metadata = legalMetadata("terms");

export default function Page() {
  return <LegalPage doc="terms" />;
}
