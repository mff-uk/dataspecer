import Link from "next/link";
import React from "react";
import { DscmeLogo } from "./dscme-logo";

const Header = ({ page, children }: { page?: string; children?: React.ReactNode }) => {
    return (
        <>
            <header className="flex h-12 w-full flex-row justify-between bg-[#5438dc] align-middle text-white">
                <Link href={"/"} className="my-auto ml-4">
                    <DscmeLogo />
                </Link>
                <div className="my-auto text-[15px]">{page}</div>
                <div>{children}</div>
            </header>
        </>
    );
};

export default Header;
