import React from "react";
import { HeaderLogoLink } from "./header-logo-link";

const Header = ({ page, children }: { page?: string; children?: React.ReactNode }) => {
    return (
        <>
            <header className="grid w-full grid-cols-1 grid-rows-[fit_auto_fit] justify-between bg-[#5438dc] text-white md:h-12 md:grid-cols-[1fr_auto_1fr] md:grid-rows-1">
                <div className="my-auto ml-4 flex flex-row">
                    <HeaderLogoLink />
                </div>
                <div className="my-auto text-[15px]">{page}</div>
                <div>{children}</div>
            </header>
        </>
    );
};

export default Header;
