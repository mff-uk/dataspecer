"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/header/dumb-header";
import { BackendPackageService, type Package, type ResourceEditable } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { getRandomName } from "../util/random-gen";
import { getLocalizedStringFromLanguageString } from "../util/language-utils";

const Page = () => {
    // should fail already when spinning up the next app
    // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
    const service = useMemo(() => new BackendPackageService(process.env.NEXT_PUBLIC_APP_BACKEND!, httpFetch), []);
    const [packages, setPackages] = useState([] as Package[]);

    const syncPackages = useCallback(() => {
        service
            .getPackage("http://dataspecer.com/packages/local-root")
            .then(({ subResources }) => {
                if (!subResources) {
                    return;
                }
                setPackages(subResources);
            })
            .catch((err) => console.error("error fetching packages from backend", err));
    }, [service]);

    useEffect(() => {
        syncPackages();
    }, [syncPackages]);

    const createPackage = async (packageId: string, packageNameCs: string) => {
        const pkg = await service.createPackage("http://dataspecer.com/packages/local-root", {
            iri: packageId,
            userMetadata: {
                name: { cs: packageNameCs },
                tags: [],
            },
        } as ResourceEditable);
        console.log(pkg);
        alert(`package ${pkg.iri}-${packageNameCs} logged to console`);
        return pkg;
    };

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
            <main className="w-full flex-grow overflow-x-hidden  overflow-y-scroll bg-teal-50 md:h-[calc(100%-48px)]">
                <div className="mx-auto flex max-w-screen-lg flex-col ">
                    <h1 className="mb-12 px-6 text-3xl font-bold tracking-tight text-gray-900">Available packages</h1>
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
                    <ul className="flex-grow">
                        {packages?.map((pkg) => {
                            const urlSearchParams = new URLSearchParams();
                            urlSearchParams.set("package-id", String(pkg.iri));
                            const search = urlSearchParams.toString();
                            const query = search ? `?${search}` : "";
                            return (
                                <li key={"package-" + pkg.iri}>
                                    <Link href={"/" + query} className="hover:text-cyan-700">
                                        {getLocalizedStringFromLanguageString(pkg.userMetadata.label ?? {}) ?? pkg.iri}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </main>
        </>
    );
};

export default Page;
