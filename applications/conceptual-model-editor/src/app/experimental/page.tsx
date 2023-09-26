"use client";

import {useEffect, useMemo, useState} from "react";
import {httpFetch} from "@dataspecer/core/io/fetch/fetch-browser";
import {SemanticModelAggregator} from "@dataspecer/core-v2/semantic-model/aggregator";
import {isSemanticModelClass, type SemanticModelClass} from "@dataspecer/core-v2/semantic-model/concepts";
import {createSgovModel} from "@dataspecer/core-v2/semantic-model/simplified";


export default function Page() {
    const {sgov, aggregatorView} = useMemo(() => {
        const aggregator = new SemanticModelAggregator();
        const sgov = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
        aggregator.addModel(sgov);
        const aggregatorView = aggregator.getView(sgov);

        sgov.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl").catch(() => null);

        return {aggregator, sgov, aggregatorView};
    }, []);

    const [classes, setClasses] = useState<SemanticModelClass[]>([]);
    const [allowedClasses, setAllowedClasses] = useState<string[]>([]);

    const toggleAllow = async (iri: string) => {
        if (allowedClasses.includes(iri)) {
            setAllowedClasses(allowedClasses.filter(allowed => allowed !== iri));
            await sgov.releaseClassSurroundings(iri);
        } else {
            setAllowedClasses([...allowedClasses, iri]);
            await sgov.allowClassSurroundings(iri);
        }
    };

    useEffect(() => {
        return aggregatorView.subscribeToChanges(() => {
            setClasses(Object.values(aggregatorView.getEntities()).map(aggregated => aggregated.aggregatedEntity).filter(isSemanticModelClass));
        });
    }, [aggregatorView]);

    return (
        <div>
            <h1>Experimental</h1>
            <ul>
                {classes.map(cls => <li key={cls.iri} onClick={() => {
                    toggleAllow(cls.iri).catch(() => null);
                }}>
                    {allowedClasses.includes(cls.iri) ? "✅" : "❌"} {cls.name["cs"]}
                </li>)}
            </ul>
        </div>
    );
}