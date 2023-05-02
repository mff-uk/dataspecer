import "~/styles/globals.css";
import Link from "next/link";
import Header from "./components/header";

export default function Page() {
    return (
        <>
            <Header page="👋" />
            <div className="mx-auto max-w-screen-lg">
                <h1 className="mb-12 px-6 text-3xl font-bold tracking-tight text-gray-900">Home</h1>
                <ul>
                    <li>
                        <Link href={"/subdirectory"}>Visit subdirectory</Link>
                    </li>
                    <li>
                        <Link href={"/viz"}>Visualization</Link>
                    </li>
                    <li>
                        <Link href={"/rdf"}>Rdf</Link>
                    </li>
                </ul>
            </div>
        </>
    );
}
