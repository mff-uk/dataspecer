import React from "react";

const Header = ({ page, children }: { page?: string; children?: React.ReactNode }) => {
    return (
        <header className="flex w-full flex-row bg-indigo-600 text-white">
            <h1 className="mx-2 p-2 text-2xl">
                <strong>Dataspecer</strong>
            </h1>
            <h2 className="my-auto">{page}</h2>
            {children}
        </header>
    );
};

export default Header;
