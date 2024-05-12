import Link from "next/link";
import React, { Children } from "react";
import { PackageManagement } from "./features/management/package-management";
import { ViewManagement } from "./features/management/view-management";
import { ExportManagement } from "./features/management/export-management";
import { LanguageManagement } from "./features/management/language-management";
import { DscmeLogo } from "../components/dscme-logo";

const HeaderDivider = () => <div className="mx-3 my-auto h-[50%] w-[1px] bg-white opacity-75" />;

const Header = () => {
    return (
        <>
            <header className="grid h-12 w-full grid-cols-3 grid-rows-1 justify-between bg-[#5438dc] text-white">
                <div className="my-auto ml-4 flex flex-row">
                    <Link href={"/"}>
                        <DscmeLogo />
                    </Link>
                </div>
                <div className="flex flex-row justify-center">
                    <PackageManagement />
                    <HeaderDivider />
                    <ViewManagement />
                    <HeaderDivider />
                    <LanguageManagement />
                </div>
                <div className="my-auto flex flex-row justify-end">
                    <ExportManagement />
                </div>
            </header>
        </>
    );
};

export default Header;
