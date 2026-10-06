import { Inter, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Fraunces({ variable: "--font-display", subsets: ["latin"], axes: ["opsz"] });

export const metadata = {
  title: "SiteControl — Construction Business Control System",
  description: "Every site. Every rupee. Every milestone. Under control. Demo: Vertex Buildcon Pvt. Ltd.",
};

const themeScript = `try{var t=localStorage.getItem("sc-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${display.variable} h-full antialiased`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
