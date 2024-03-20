import Link from "next/link";
import React, { Children } from "react";
import { PackageManagement } from "./management/package-management";
import { ViewManagement } from "./management/view-management";
import { ExportManagement } from "./management/export-management";

const Logo = () => {
    return (
        <div className="my-auto flex flex-row">
            <div className="text-3xl font-bold text-white">ds</div>
            <div className="text-[15px] font-semibold text-[#ff5964]">cme</div>
        </div>
    );
};

const Header = () => {
    return (
        <>
            <header className="grid h-12 w-full grid-cols-3 grid-rows-1 justify-between bg-[#5438dc] text-white">
                <div className="my-auto ml-4 flex flex-row">
                    <Link href={"/"}>
                        <Logo />
                    </Link>
                </div>
                <div className="flex flex-row justify-center">
                    <PackageManagement />
                    <div className="mx-3 my-auto h-[50%] w-[1px] bg-white opacity-75" />
                    <ViewManagement />
                </div>
                <div className="my-auto flex flex-row justify-end">
                    <ExportManagement />
                </div>
            </header>
        </>
    );
};

export default Header;
