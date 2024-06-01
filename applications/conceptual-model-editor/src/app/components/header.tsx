import React from "react";
import { DscmeLogo } from "./dscme-logo";

export const HeaderLogoLink = () => {
    const redirectPath = process.env.NEXT_PUBLIC_DSCME_LOGO_LINK;
    if (!redirectPath) {
        throw new Error("redirect path for HeaderLogoLink is undefined");
    }
    // use anchor instead of next/Link because of the cme base path
    return (
        <a href={redirectPath} className="my-auto" title="leave to manager without saving">
            <DscmeLogo />
        </a>
    );
};

const Header = ({ page, children }: { page?: string; children?: React.ReactNode }) => {
    return (
        <>
            <header className="flex h-12 w-full flex-row justify-between bg-[#5438dc] align-middle text-white">
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
