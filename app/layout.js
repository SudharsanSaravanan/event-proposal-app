import "./globals.css";
import localFont from "next/font/local";

const gilroy = localFont({
  src: [
    {
      path: "_fonts/Gilroy-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-ExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-Heavy.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-HeavyItalic.ttf",
      weight: "900",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-RegularItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "_fonts/Gilroy-UltraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "_fonts/Gilroy-UltraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
  ],
  display: "swap",
});

export const metadata = {
  title: "Anokha | Event Proposals",
  description: "Anokha | Event Proposals Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${gilroy.className} antialiased`}>{children}</body>
    </html>
  );
}
