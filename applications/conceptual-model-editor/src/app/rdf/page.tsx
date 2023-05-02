"use client";
import React, { useMemo, useState } from "react";
import { cimAdapter } from "./rdf-loader";
import { PimClass } from "@dataspecer/core/pim/model";
import { CoreResource } from "@dataspecer/core/core";

import { rdfres } from "./tmp";
import { RdfQuad } from "@dataspecer/core/io/rdf/rdf-api";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";

const Page = () => {
    const [searchedName, setSeachedName] = useState<string>("");
    const [searched, setSearched] = useState<PimClass[]>([]);
    const [hierarchy, setHierarchy] = useState<string[]>([]);
    const [allClasses, setAllClasses] = useState<PimClass[]>([]);
    //@ts-ignore default value
    const [entities, setEntities] = useState<Record<string, CoreResource>>(null);
    const [quads, setQuads] = useState<RdfQuad[]>([]);

    useMemo(async () => {
        cimAdapter.search(searchedName).then((val: PimClass[]) => setSearched(val));
        cimAdapter.getCim().then((val) => {
            console.log(val.entities);
            setEntities(val.entities);
        });
        cimAdapter
            .getFullHierarchy(searchedName)
            .then((val) => val.listResources())
            .then((val) => setHierarchy(val));
    }, [searchedName]);

    useMemo(async () => {
        await rdfres.fetch(httpFetch, "https://mff-uk.github.io/demo-vocabularies/original/adms.ttl", "text/turtle");
        setQuads(rdfres.getQuads());
    }, []);

    return (
        <>
            {quads.map((val) => {
                return (
                    <div className="flex flex-row justify-between">
                        <div>{val.subject.value}</div>
                        <div>{val.predicate.value}</div>
                        <div>{val.object.value.substring(0, 30)}</div>
                    </div>
                );
            })}
        </>
    );
};

export default Page;
