import "~/styles/globals.css";
import Link from "next/link";
import Header from "./components/header";
import { DscmeLogo } from "./components/dscme-logo";

export default function Page() {
    const managerPath = process.env.NEXT_PUBLIC_DSCME_LOGO_LINK;
    if (!managerPath) {
        throw new Error("redirect path for package manager is undefined");
    }

    return (
        <>
            <Header page="👋" />
            <div className="mx-auto max-w-screen-lg">
                <h1 className="mb-12 mt-2 flex flex-row px-6 text-3xl font-bold tracking-tight text-gray-900">
                    Home of
                    <span className="mx-2 rounded-full bg-[#5438dc] px-2">
                        <DscmeLogo />
                    </span>
                </h1>
                <ul className="px-2 [&>li]:mb-6 [&>li]:flex [&>li]:w-full [&>li]:flex-col md:[&>li]:flex-row">
                    <li>
                        <p>
                            You can either start playing with the editor right away. However you won't be able to save
                            your work to our backend. There will still be the option to save your workspace to{" "}
                            <span className="font-mono text-[#5438dc]">.json</span> or export{" "}
                            <span className="font-mono text-[#5438dc]">lightweight ontology.</span>
                        </p>
                        <p className="mx-auto mt-3 md:my-auto md:ml-2 md:mr-0 md:flex-grow">
                            <Link
                                href={"/core-v2"}
                                className="text-nowrap border border-black px-2 py-1 hover:bg-[#5438dc] hover:text-white"
                            >
                                work w/o packages
                            </Link>
                        </p>
                    </li>
                    <li>
                        <p>
                            To be able to save your work to our backend and have it accessible from anywhere, open up
                            the <span className="font-mono text-[#5438dc]"></span>
                        </p>
                        <p className="mx-auto mt-3 text-right md:my-auto md:ml-2 md:mr-0 md:flex-grow">
                            <a
                                className="text-nowrap border border-black px-2 py-1 hover:bg-[#5438dc] hover:text-white "
                                href={managerPath}
                            >
                                package manager
                            </a>
                        </p>
                    </li>
                </ul>
            </div>
        </>
    );
}
