import { HttpSynchronizedStore } from "@dataspecer/backend-utils/stores";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { PimClass } from "@dataspecer/core/pim/model/pim-class";
import { PimResource } from "@dataspecer/core/pim/model/pim-resource";
import { PimSetHumanDescription } from "@dataspecer/core/pim/operation/pim-set-human-description";
import { PimSetHumanLabel } from "@dataspecer/core/pim/operation/pim-set-human-label";
import LoadingButton from '@mui/lab/LoadingButton';
import { isEqual } from "lodash";
import { useSnackbar } from "notistack";
import React, { memo, useContext } from "react";
import { getAdapter } from "../../editor/configuration/adapters/get-adapter";
import { DataSpecificationsContext } from "../app";

export const UpdatePim = memo(({dataSpecificationIri} : {dataSpecificationIri: string}) => {
    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const {enqueueSnackbar} = useSnackbar();
    
    const [loading, setLoading] = React.useState(false);
    const run = async () => {
        setLoading(true);
        const specification = dataSpecifications[dataSpecificationIri as string];
        const storeDescriptor = specification.pimStores[0];
        const store = HttpSynchronizedStore.createFromDescriptor(storeDescriptor, httpFetch);
        await store.load();
        const allResources = await Promise.all((await store.listResources()).map(iri => store.readResource(iri))) as PimResource[];

        const {cimAdapter} = getAdapter(specification.cimAdapters);

        const diffPairs: [PimResource, PimResource][] = [];

        const classes = await store.listResourcesOfType(PimClass.TYPE);
        for (const pimClassIri of classes) {
            const pimClass = await store.readResource(pimClassIri) as PimClass;
            const cimClass = await cimAdapter.getClass(pimClass.pimInterpretation);

            if (!cimClass) {
                continue;
            }

            if (
                !isEqual(pimClass.pimHumanLabel, cimClass.pimHumanLabel) ||
                !isEqual(pimClass.pimHumanDescription, cimClass.pimHumanDescription)
             ) {
                diffPairs.push([pimClass, cimClass]);
            }

            // const surroundings = await cimAdapter.getSurroundings(pimClass.pimInterpretation);
            // const surroundingResources = await surroundings.listResources();
            // for (const surroundingIri of surroundingResources) {
            //     const surroudingResource = await store.readResource(surroundingIri) as PimResource;
            //     const pimResources = allResources.filter(r => r.pimInterpretation === surroundingIri);

            //     for (const pimResource of pimResources) {
            //         if (
            //             !isEqual(pimResource.pimHumanLabel, surroudingResource.pimHumanLabel) ||
            //             !isEqual(pimResource.pimHumanDescription, surroudingResource.pimHumanDescription)
            //         ) {
            //             diffPairs.push([pimResource, surroudingResource]);
            //         }
            //     }
            // }
        }

        for (const [pimResource, cimResource] of diffPairs) {
            if (!isEqual(pimResource.pimHumanLabel, cimResource.pimHumanLabel)) {
                const op = new PimSetHumanLabel();
                op.pimResource = pimResource.iri;
                op.pimHumanLabel = cimResource.pimHumanLabel;
                await store.applyOperation(op);
            }
            if (!isEqual(pimResource.pimHumanDescription, cimResource.pimHumanDescription)) {
                const op = new PimSetHumanDescription();
                op.pimResource = pimResource.iri;
                op.pimHumanDescription = cimResource.pimHumanDescription;
                await store.applyOperation(op);
            }
        }

        await store.save();
        setLoading(false);

        enqueueSnackbar(`${diffPairs.length} PIM classes updated.`, {variant: "success"});
    }

    return <LoadingButton
        disabled={loading}
        loading={loading}
        onClick={run}>Update PIM</LoadingButton>
});
