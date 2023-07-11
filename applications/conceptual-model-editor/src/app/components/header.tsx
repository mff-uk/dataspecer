import Link from "next/link";
import React from "react";

const Logo = () => {
    return (
        <div className="my-auto flex flex-row">
            <div className="  text-3xl font-bold text-white">ds</div>
            <div className="text-[15px] text-[#c7556f]">cme</div>
        </div>
    );
};

const Header = ({ page, children }: { page?: string; children?: React.ReactNode }) => {
    return (
        <>
            <header className="flex h-12 w-full flex-row justify-between bg-[#5438dc] align-middle text-white">
                <Link href={"/"} className="my-auto ml-4">
                    <Logo />
                </Link>
                <div className="my-auto text-[15px]">{page}</div>
                <div>{children}</div>
            </header>
        </>
    );
};

export default Header;
