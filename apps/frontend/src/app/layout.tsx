import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Providers from "@/modules/cloud-enthusiasts/shared/components/Providers";
import { AuthWrapper } from "@/components/AuthWrapper";

export const metadata: Metadata = {
  title: "AWS SBG REC Event Registration",
  description: "Register for AWS Cloud Practitioner bootcamps, serverless workshops, and container orchestration bootcamps.",
  icons: {
    icon: '/brand-logo.png',
  },
};

function LayoutSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1A222D] z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-[#FF9900] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col cloud-mesh-bg antialiased">
        <Providers>
          <AuthWrapper>
            <Suspense fallback={<LayoutSpinner />}>
              {children}
            </Suspense>
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
