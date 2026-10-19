import { LegalPage, legalMetadata } from "@/components/group-c/legal";

export const metadata = legalMetadata("privacy");

export default function Page() {
  return <LegalPage doc="privacy" />;
}
