import type { Metadata } from "next";
import Link from "next/link";
import { PreviewForm } from "@/components/forms";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Join Erudite Africa Connect free · Erudite Africa Connect",
  description: "One account for everything: programs, investment, recovery and learning.",
};

const roles = [
  "I have an idea or startup",
  "I run a business and want to raise capital or sell",
  "My business needs help to recover",
  "I want to invest or buy a business",
  "I want to mentor or offer advisory services",
  "I represent a partner institution",
];

export default function JoinPage() {
  return (
    <>
      <PageHero title="Join Erudite Africa Connect free" subhead="One account for everything: programs, investment, recovery and learning." />
      <section className="bg-canvas py-16">
        <Container>
          <div className="mx-auto max-w-lg rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8">
            <PreviewForm
              submitLabel="Create account"
              confirmation="We have sent a 6-digit code to your phone or email. Enter it below."
              fields={[
                { name: "role", label: "What brings you to Erudite Africa Connect?", type: "select", options: roles, required: true },
                { name: "name", label: "Full name", required: true },
                { name: "contact", label: "Email or phone number", required: true },
                {
                  name: "password",
                  label: "Password",
                  type: "password",
                  helper: "At least 8 characters, with a number",
                  required: true,
                },
                {
                  name: "language",
                  label: "Preferred language",
                  type: "select",
                  options: ["English", "Amharic"],
                  required: true,
                },
                {
                  name: "terms",
                  label: "I agree to the Terms of Use and Privacy Policy",
                  type: "checkbox",
                  required: true,
                },
              ]}
            />
            <p className="mt-3 text-xs text-muted">
              Read the{" "}
              <Link href="/legal/terms" className="text-brand-700 underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-brand-700 underline">
                Privacy Policy
              </Link>
              .
            </p>

            <div className="mt-6 space-y-2 border-t border-line pt-6">
              {["Continue with Google", "Continue with LinkedIn"].map((label) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Not available in this preview"
                  className="w-full cursor-not-allowed rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-muted"
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-muted">
              Already a member?{" "}
              <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
