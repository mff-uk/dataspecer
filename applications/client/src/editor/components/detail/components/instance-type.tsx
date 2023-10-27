import * as React from "react";
import {memo, useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {Box, FormControlLabel, Radio, RadioGroup, Typography} from "@mui/material";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {useSaveHandler} from "../../helper/save-handler";
import {SetInstancesSpecifyTypes} from "../../../operations/set-inastances-specify-types";
import {InfoHelp} from "../../../../components/info-help";

export const InstanceType = memo(({psmClassIri}: {psmClassIri: string | null | undefined}) => {
    const {t} = useTranslation("detail");
    const store = useFederatedObservableStore();

    const {resource: rawResource} = useResource(psmClassIri ?? null);
    const resource = DataPsmClass.is(rawResource) ? rawResource : null;


    const [instancesSpecifyTypes, setInstancesSpecifyTypes] = useState<"OPTIONAL" | "NEVER" | undefined>(undefined);
    const currentInstancesSpecifyTypes = (resource as DataPsmClass).instancesSpecifyTypes === "ALWAYS" ? undefined : (resource as DataPsmClass).instancesSpecifyTypes as "OPTIONAL" | "NEVER" | undefined ;
    useEffect(() => {
            setInstancesSpecifyTypes(currentInstancesSpecifyTypes);
    }, [resource, currentInstancesSpecifyTypes]);

    useSaveHandler(
        currentInstancesSpecifyTypes !== instancesSpecifyTypes,
        useCallback(
            async () => resource && await store.executeComplexOperation(new SetInstancesSpecifyTypes(resource.iri as string, instancesSpecifyTypes)),
            [resource, store, instancesSpecifyTypes]
        )
    );

    return <>
        {resource && <>
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('instancesSpecifyTypes.title')} <InfoHelp text={t('instancesSpecifyTypes.help')} />
                </Typography>
                <RadioGroup
                    row
                    value={instancesSpecifyTypes ?? "ALWAYS"}
                    onChange={el => setInstancesSpecifyTypes(el.target.value === "ALWAYS" ? undefined : el.target.value as "OPTIONAL" | "NEVER" | undefined)}
                >
                    <FormControlLabel value="ALWAYS" control={<Radio />} label={t('instancesSpecifyTypes.value.always')} />
                    <FormControlLabel value="OPTIONAL" control={<Radio />} label={t('instancesSpecifyTypes.value.optional')} />
                    <FormControlLabel value="NEVER" control={<Radio />} label={t('instancesSpecifyTypes.value.never')} />
                </RadioGroup>
            </Box>
        </>}
    </>
});