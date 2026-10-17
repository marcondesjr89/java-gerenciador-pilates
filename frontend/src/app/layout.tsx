import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gerenciador Pilates",
  description: "Painel operacional para studio de pilates."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

const themeScript = `(function() {
  try {
    var storedTheme = localStorage.getItem('gp-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      document.documentElement.dataset.theme = storedTheme;
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

