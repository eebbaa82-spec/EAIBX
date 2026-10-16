import { HomePage } from "@/components/home/HomePage";
import { homeCopy } from "@/i18n/home";

export default function Home() {
  return <HomePage t={homeCopy.en!} locale="en" />;
}
