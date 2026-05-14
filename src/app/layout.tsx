import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senacare",
  description:
    "高単価背中ケア専門サロン向け、来店と来店の「間」の体験を設計する顧客管理プラットフォーム。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
