import Link from "next/link";
import React, { Children } from "react";
import { PackageManagement } from "./package-management";
import { ViewManagement } from "./view-management";
import { ExportManagement } from "./export-management";

const Logo = () => {
    return (
        <div className="my-auto flex flex-row">
            <div className="  text-3xl font-bold text-white">ds</div>
            <div className="text-[15px] text-[#c7556f]">cme</div>
        </div>
    );
};

const Header = () => {
    return (
        <>
            <header className="flex h-12 w-full flex-row justify-between bg-[#5438dc] align-middle text-white">
                <Link href={"/"} className="my-auto ml-4">
                    <Logo />
                </Link>
                <div className="flex flex-row">
                    <PackageManagement />
                    <div className="mx-3 my-auto h-[50%] w-[1px] bg-white opacity-75" />
                    <ViewManagement />
                </div>
                <div className="my-auto">
                    <ExportManagement />
                </div>
            </header>
        </>
    );
};

export default Header;
