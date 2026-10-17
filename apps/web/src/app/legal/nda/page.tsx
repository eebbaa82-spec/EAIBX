import { LegalPage, legalMetadata } from "@/components/group-c/legal";

export const metadata = legalMetadata("nda");

export default function Page() {
  return <LegalPage doc="nda" />;
}
