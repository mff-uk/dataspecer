import "~/styles/globals.css";
import Link from "next/link";
import Header from "../components/header";
import { getRandomName, getRandomNumberInRange } from "../utils/random-gen";

type CimSpecification = {
    name: string;
    uri: string;
    classUris: string[];
    views: string[];
};

const CimSpecificationItem = (props: { cimSpec: CimSpecification }) => {
    return (
        <div className="my-2 flex flex-row justify-between border-2 border-indigo-50 p-2 transition ease-in-out hover:bg-indigo-50">
            <Link href={`/viz?cim-specification=${encodeURI(props.cimSpec.uri)}`}>
                <div>
                    <h3 className="font-bold ">{props.cimSpec.name}</h3>

                    <h4 className="text-slate-600">{props.cimSpec.uri}</h4>
                </div>
            </Link>
            <div className="text-slate-600">
                <div>{`${props.cimSpec.classUris.length} classes`}</div>
                <div>{`${props.cimSpec.views.length} views`}</div>
            </div>
        </div>
    );
};

const getSampleCimSpecifications = (count = 15) => {
    const randomUri = (what: string) => `https://cim-specifications.com/${what}/${getRandomName()}`;

    return [...Array(count).keys()].map((_idx) => {
        return {
            name: getRandomName(),
            uri: randomUri("spec"),
            classUris: [...Array(getRandomNumberInRange(3, 6)).keys()].map((_numbr) => randomUri("calss")),
            views: [...Array(getRandomNumberInRange(1, 3)).keys()].map((_numbr) => randomUri("view")),
        } as CimSpecification;
    });
};

export default function Page() {
    const cimSpecifications = getSampleCimSpecifications(15);

    return (
        <>
            <Header page="Cim Manager" />
            <div className="wrapper mx-auto max-w-screen-xl">
                <h1 className="mb-8 mt-6 text-3xl font-bold tracking-tight text-gray-900">This is a subdirectory.</h1>
                <p>The purpose is to test the build and deployment.</p>
                <Link href={"/"} className="text-indigo-800 hover:text-indigo-500">
                    Go back to the main site.
                </Link>

                <div className="my-2 w-full border-b-2 border-indigo-200" id="divider" />

                <div>
                    <h1 className="mb-4 text-xl font-bold">Cim specifications</h1>
                    {cimSpecifications.map((cs) => (
                        <CimSpecificationItem cimSpec={cs} key={cs.uri} />
                    ))}
                </div>
            </div>
        </>
    );
}
