export const metadata = {
    title: "Dataspecer Conceptual Model Editor"
};

import React from "react";
import "~/styles/globals.css";

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return  <html lang="en">
        <body className="max-w-screen-lg mx-auto">
            {children}
        </body>
    </html>;
}
