import { LegalPage, legalMetadata } from "@/components/group-c/legal";

export const metadata = legalMetadata("investor-disclaimer");

export default function Page() {
  return <LegalPage doc="investor-disclaimer" />;
}
