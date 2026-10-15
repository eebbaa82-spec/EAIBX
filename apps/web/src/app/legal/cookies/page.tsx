import { LegalPage, legalMetadata } from "@/components/group-c/legal";

export const metadata = legalMetadata("cookies");

export default function Page() {
  return <LegalPage doc="cookies" />;
}
