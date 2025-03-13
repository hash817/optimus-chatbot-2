import { Geist } from "next/font/google";
import UiContextProvider from "@/store/ui-context";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "OptimusLex - AI-Powered Legal Chatbot for Singapore",
  description: "OptimusLex is an AI-driven legal chatbot specializing in Singapore law.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body>
        <main>
          <UiContextProvider>
            {children}
          </UiContextProvider>
        </main>
      </body>
    </html>
  );
}
