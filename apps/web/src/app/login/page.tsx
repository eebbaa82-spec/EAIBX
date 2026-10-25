import type { Metadata } from "next";
import Link from "next/link";
import { PreviewForm } from "@/components/forms";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Log in · Kenna Ventures",
  description: "Welcome back. Log in to your Kenna Ventures account for programs, investment, recovery and learning.",
};

export default function LoginPage() {
  return (
    <>
      <PageHero title="Welcome back" />
      <section className="bg-canvas py-16">
        <Container>
          <div className="mx-auto max-w-lg rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8">
            <PreviewForm
              submitLabel="Log in"
              confirmation="We have sent a 6-digit code to your phone or email. Enter it below."
              fields={[
                { name: "contact", label: "Email or phone number", required: true },
                { name: "password", label: "Password", type: "password", required: true },
              ]}
            />
            <div className="mt-6 border-t border-line pt-6 text-sm text-muted">
              <h2 className="font-semibold text-ink">Forgot password?</h2>
              <p className="mt-1">Enter your email or phone and we will send you a reset link.</p>
            </div>
            <p className="mt-6 text-center text-sm text-muted">
              New to Kenna Ventures?{" "}
              <Link href="/join" className="font-semibold text-brand-700 hover:underline">
                Join Kenna Ventures free
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
