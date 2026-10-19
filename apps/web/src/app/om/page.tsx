import type { Metadata } from "next";
import Link from "next/link";
import { HomePage } from "@/components/home/HomePage";
import { Container } from "@/components/ui";
import { translator } from "@/i18n/chrome";
import { homeCopy } from "@/i18n/home";

export const metadata: Metadata = {
  title: "Investopia · Murtii Daldalaa Ogummaa Qabu Humneessina",
  description: "Kaappitaala walitti qabaa, daldala gurgurraa, sagantaa saffisiisaa makamaa ykn rakkoo irraa deebi'aa. Daldaltootaa fi invastaroota Itoophiyaa mirkanaa'an bakka tokkotti.",
  alternates: { languages: { en: "/", am: "/am/", om: "/om/" } },
};

export default function OromoHome() {
  const t = translator("om");
  return (
    <div lang="om">
      <div className="border-b border-gold-400 bg-gold-100 py-2 text-sm text-ink">
        <Container className="flex flex-wrap items-center justify-between gap-2">
          <p>{t("draftNotice")}</p>
          <Link href="/" lang="en" className="font-semibold text-brand-700 hover:underline">
            {t("readInEnglish")}
          </Link>
        </Container>
      </div>
      <HomePage t={homeCopy.om!} locale="om" />
    </div>
  );
}
