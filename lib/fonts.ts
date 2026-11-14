// lib/fonts.ts - Blogology fonts (next/font/google, self-hosted at build time)
import { Fraunces, Newsreader, Inter } from "next/font/google";

// Display serif: headlines only (weight 600). Never for buttons or small UI text.
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

// Reading serif: article body, standfirst, bylines.
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});

// UI sans: nav, buttons, forms, tables, dashboard.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Put this on <html className=...>
export const fontVariables = `${fraunces.variable} ${newsreader.variable} ${inter.variable}`;