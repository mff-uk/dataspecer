import "~/styles/globals.css";
import Link from "next/link";
import Header from "./components/header";

export default function Page() {
    const managerPath = process.env.NEXT_PUBLIC_DSCME_LOGO_LINK;
    if (!managerPath) {
        throw new Error("redirect path for package manager is undefined");
    }

    return (
        <>
            <Header page="👋" />
            <div className="mx-auto max-w-screen-lg">
                <h1 className="mb-12 px-6 text-3xl font-bold tracking-tight text-gray-900">Home</h1>
                <ul>
                    <li>
                        <Link href={"/core-v2"}>work w/o packages</Link>
                    </li>
                    <li>
                        <a href={managerPath}>package manager</a>
                    </li>
                </ul>
            </div>
        </>
    );
}
