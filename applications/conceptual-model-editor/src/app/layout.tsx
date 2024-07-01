export const metadata = {
    title: "ds-cme",
};

import React from "react";
import "~/styles/globals.css";
import { Suspense } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-screen">
            <body className="flex h-screen w-screen flex-col">
                <Suspense>{children}</Suspense>
            </body>
        </html>
    );
}
