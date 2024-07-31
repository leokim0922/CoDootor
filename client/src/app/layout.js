import { Inter } from "next/font/google";
import "./globals.css";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CoDootor :: Just Codin'",
  description: "CoDootoring students until they succeed at coding.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <UserProvider>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
      </UserProvider>
    </html>
  );
}
