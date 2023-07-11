export const metadata = {
    title: "ds-cme",
};

import React from "react";
import "~/styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-[100%]">
            <body className="h-[100%]">{children}</body>
        </html>
    );
}
