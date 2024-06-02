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
