"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import { BackendPackageService, Package } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { getOneNameFromLanguageString } from "../core-v2/util/utils";

const Page = () => {
    const BACKEND_URL = "http://localhost:3100";
    const service = useMemo(() => new BackendPackageService(BACKEND_URL, httpFetch), []);

    const listPackages = async () => {
        return service.listPackages();
    };

    const [packages, setPackages] = useState([] as Package[]);

    useEffect(() => {
        const getPackages = async () => {
            setPackages(await listPackages());
        };
        getPackages();
    }, []);

    return (
        <>
            <Header page="project manager 📚" />
            <main className="mx-auto max-w-screen-lg">
                <h1 className="mb-12 px-6 text-3xl font-bold tracking-tight text-gray-900">Available packages</h1>
                <ul>
                    {packages?.map((pkg) => {
                        const urlSearchParams = new URLSearchParams();
                        urlSearchParams.set("package-id", String(pkg.id));
                        const search = urlSearchParams.toString();
                        const query = search ? `?${search}` : "";
                        return (
                            <li key={"package-" + pkg.id}>
                                <Link href={"/core-v2" + query} className="hover:text-cyan-700">
                                    core-v2: {getOneNameFromLanguageString(pkg.name).t}
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
