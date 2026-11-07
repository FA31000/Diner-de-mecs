import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Repas des mecs",
  description: "Ordre de priorité des invités pour le prochain dîner",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <nav>
          <Link href="/">Prochain dîner</Link>
          <Link href="/diners">Dîners précédents</Link>
          <Link href="/stats">Statistiques</Link>
          <Link href="/regles">Règles</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
