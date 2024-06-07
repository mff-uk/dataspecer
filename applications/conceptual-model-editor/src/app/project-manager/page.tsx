"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import { type Package } from "@dataspecer/core-v2/project";
import { getRandomName } from "../utils/random-gen";
import { getLocalizedStringFromLanguageString } from "../diagram/util/language-utils";
import { useBackendConnection } from "../diagram/backend-connection";

/**
 * A built-in version of package manager. You can use this implementation when developing locally.
 * The manager can be reached by clicking `dscme` logo, when the app is deployed, the logo leads to the dedicated manager app
 */
const Page = () => {
    const { createPackage, getPackageFromBackend, backendPackageRootUrl } = useBackendConnection();
    const [packages, setPackages] = useState([] as Package[]);

    const syncPackages = useCallback(() => {
        getPackageFromBackend(backendPackageRootUrl)
            .then(({ subResources }) => {
                if (!subResources) {
                    return;
                }
                setPackages(subResources);
            })
            .catch((err) => console.error("error fetching packages from backend", err));
    }, [getPackageFromBackend, backendPackageRootUrl]);

    useEffect(() => {
        syncPackages();
    }, [syncPackages]);

    const handleCreatePackage = () => {
        const pkgName = getRandomName(12);
        createPackage(pkgName, pkgName)
            .then((_) => syncPackages())
            .catch((reason) => {
                alert("there was a problem creating package on backend");
                console.error(reason);
            });
    };

    return (
        <>
            <Header page="project manager 📚" />
            <main className="overflow-y-scroll md:h-[calc(100%-48px)]">
                <div className="mx-auto max-w-screen-lg">
                    <h1 className="mb-12 px-6 text-3xl font-bold tracking-tight text-gray-900">Available packages</h1>
                    <div className="w-full">
                        <div className="flex flex-row">
                            <button
                                className="white ml-2"
                                title="sync package inventory with backend"
                                onClick={() => syncPackages()}
                            >
                                🔄
                            </button>
                            <button
                                className="mx-1 bg-yellow-600 px-1"
                                title="create a new package"
                                onClick={handleCreatePackage}
                            >
                                ➕pkg
                            </button>
                        </div>
                        <Suspense>
                            <ul>
                                {packages?.map((pkg) => {
                                    const urlSearchParams = new URLSearchParams();
                                    urlSearchParams.set("package-id", String(pkg.iri));
                                    const search = urlSearchParams.toString();
                                    const query = search ? `?${search}` : "";
                                    return (
                                        <li key={"package-" + pkg.iri}>
                                            <Link href={"/diagram" + query} className="hover:text-cyan-700">
                                                diagram:{" "}
                                                {getLocalizedStringFromLanguageString(pkg.userMetadata.label ?? {}) ??
                                                    pkg.iri}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Suspense>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Page;
