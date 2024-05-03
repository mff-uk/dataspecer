"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import { BackendPackageService, Package, ResourceEditable } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { getOneNameFromLanguageString } from "../core-v2/util/utils";
import { getRandomName } from "../utils/random-gen";

const Page = () => {
    const service = useMemo(() => new BackendPackageService(process.env.NEXT_PUBLIC_APP_BACKEND!, httpFetch), []);

    const syncPackages = async () => {
        setPackages((await service.getPackage("http://dataspecer.com/packages/local-root")).subResources!);
    };

    const [packages, setPackages] = useState([] as Package[]);

    useEffect(() => {
        syncPackages();
    }, []);

    const createPackage = async (packageId: string, packageNameCs: string) => {
        const pkg = await service.createPackage("http://dataspecer.com/packages/local-root", {
            iri: packageId,
            userMetadata: {
                name: { cs: packageNameCs },
                tags: [],
            }
        } as ResourceEditable);
        console.log(pkg);
        alert(`package ${pkg.iri}-${packageNameCs} logged to console`);
        return pkg;
    };

    return (
        <>
            <Header page="project manager 📚" />
            <main className="mx-auto max-w-screen-lg">
                <h1 className="mb-12 px-6 text-3xl font-bold tracking-tight text-gray-900">Available packages</h1>
                <div className="flex flex-row">
                    <button className="white ml-2" title="sync package inventory with backend" onClick={syncPackages}>
                        🔄
                    </button>
                    <button
                        className="mx-1 bg-yellow-600 px-1"
                        title="create a new package"
                        onClick={async () => {
                            const pkgName = getRandomName(7);
                            const pkg = await createPackage(pkgName, pkgName)
                                .then((resp) => resp)
                                .catch((reason) => {
                                    alert("there was a problem creating package on backend");
                                    console.error(reason);
                                });
                            if (pkg) {
                                syncPackages();
                            }
                        }}
                    >
                        ➕pkg
                    </button>
                </div>
                <ul>
                    {packages?.map((pkg) => {
                        const urlSearchParams = new URLSearchParams();
                        urlSearchParams.set("package-id", String(pkg.iri));
                        const search = urlSearchParams.toString();
                        const query = search ? `?${search}` : "";
                        return (
                            <li key={"package-" + pkg.iri}>
                                <Link href={"/core-v2" + query} className="hover:text-cyan-700">
                                    core-v2: {getOneNameFromLanguageString(pkg.userMetadata.name ?? {})?.t || pkg.iri}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </main>
        </>
    );
};

export default Page;
