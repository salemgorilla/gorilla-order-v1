import "./globals.css";
export const metadata = { title: "Gorilla Order", description: "Custom print ordering for Gorilla Salem" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
