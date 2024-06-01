import React from "react";
import { PackageManagement } from "./features/management/package-management";
import { ViewManagement } from "./features/management/view-management";
import { ExportManagement } from "./features/management/export-management";
import { LanguageManagement } from "./features/management/language-management";
import { HeaderLogoLink } from "../components/header";

const HeaderDivider = () => <div className="mx-3 my-auto w-[1px] bg-white opacity-75" />;

const Header = () => {
    return (
        <>
            <header className="grid w-full grid-cols-1 grid-rows-[fit_auto_fit] justify-between bg-[#5438dc] text-white md:h-12 md:grid-cols-[1fr_auto_1fr] md:grid-rows-1">
                <div className="my-auto ml-4 flex flex-row">
                    <HeaderLogoLink />
                </div>
                <div className="my-2 flex flex-row px-2 md:my-0 md:justify-center md:px-0">
                    <div className="my-auto mr-2 flex flex-col md:flex-row [&>*]:my-1">
                        <PackageManagement />
                        <HeaderDivider />
                        <ViewManagement />
                        <HeaderDivider />
                        <LanguageManagement />
                    </div>
                </div>
                <div className="my-2 flex flex-row px-2 md:my-0 md:justify-end md:px-0">
                    <ExportManagement />
                </div>
            </header>
        </>
    );
};

export default Header;
