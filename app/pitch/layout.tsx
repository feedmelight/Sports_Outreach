import { Bebas_Neue, DM_Sans, DM_Mono } from "next/font/google";
import { headers } from "next/headers";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export default async function PitchLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const league = h.get("x-league") || "";

  return (
    <div className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable}`}>
      {league && (
        <link rel="icon" href={`/api/favicon?league=${league}`} type="image/png" />
      )}
      {children}
    </div>
  );
}
