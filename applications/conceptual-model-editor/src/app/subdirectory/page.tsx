import "~/styles/globals.css";
import Link from "next/link";

export default function Page() {
    return <>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 mb-12 px-6'>This is a subdirectory.</h1>
        <p>The purpose is to test the build and deployment.</p>
        <Link href={"/"}>Go back to the main site.</Link>
    </>;
}
