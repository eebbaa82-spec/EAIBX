import { LegalPage, legalMetadata } from "@/components/group-c/legal";

export const metadata = legalMetadata("community");

export default function Page() {
  return <LegalPage doc="community" />;
}
