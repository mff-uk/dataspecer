export const metadata = {
    title: "ds-cme",
};

import React from "react";
import "~/styles/globals.css";
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-[100%]">
            <body className="h-[100%]"><Suspense>{children}</Suspense></body>
        </html>
    );
}
