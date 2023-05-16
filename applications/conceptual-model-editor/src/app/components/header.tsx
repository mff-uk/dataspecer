import Link from "next/link";
import React from "react";

const Header = ({ page, children }: { page?: string; children?: React.ReactNode }) => {
    return (
        <>
            <header className="flex h-16 w-full flex-row bg-indigo-700 text-white">
                <h1 className="mx-2 my-auto text-2xl">
                    <Link href={"/"}>
                        <strong>Dataspecer</strong>
                    </Link>
                </h1>
                <h2 className="my-auto text-2xl">{page}</h2>
                {children}
            </header>
        </>
    );
};

export default Header;
