import type { Metadata } from "next";
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
            {children}
          </AuthWrapper>
        </Providers>
      </body>
    </html>
  );
}
