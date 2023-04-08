import "~/styles/globals.css";
import Link from "next/link";

export default function Page() {
    return <>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 mb-12 px-6'>Dataspecer - Conceptual Model Editor</h1>
        <Link href={"/subdirectory"}>Visit subdirectory</Link>
    </>;
}
