import Link from "next/link";
import React, { Children } from "react";
import { PackageManagement } from "./package-management";

const Logo = () => {
    return (
        <div className="my-auto flex flex-row">
            <div className="  text-3xl font-bold text-white">ds</div>
            <div className="text-[15px] text-[#c7556f]">cme</div>
        </div>
    );
};

const Header = ({ children }: { children?: React.ReactNode }) => {
    return (
        <>
            <header className="flex h-12 w-full flex-row justify-between bg-[#5438dc] align-middle text-white">
                <Link href={"/"} className="my-auto ml-4">
                    <Logo />
                </Link>
                <PackageManagement />
                <div>{children}</div>
            </header>
        </>
    );
};

export default Header;
