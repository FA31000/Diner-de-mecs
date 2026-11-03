import "./globals.css";

export const metadata = {
  title: "Repas des mecs",
  description: "Ordre de priorité des invités pour le prochain dîner",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
