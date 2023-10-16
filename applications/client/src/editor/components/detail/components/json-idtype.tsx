import * as React from "react";
import {memo, useEffect} from "react";
import {useTranslation} from "react-i18next";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {Box, FormControlLabel, Radio, RadioGroup, Typography} from "@mui/material";
import {DataPsmClass} from "@dataspecer/core/data-psm/model";
import {useSaveHandler} from "../../helper/save-handler";
import {SetJsonIdtype} from "../../../operations/set-json-idtype";

function getState(resource: DataPsmClass) {
    const optional = resource.jsonIdRequired === false &&
        resource.jsonTypeRequired === false &&
        resource.jsonIdKeyAlias === undefined &&
        resource.jsonTypeKeyAlias === undefined;

    const remove = resource.jsonIdKeyAlias === null &&
        resource.jsonTypeKeyAlias === null;

    return optional ? "OPTIONAL" : remove ? "REMOVE" : "DEFAULT";
}

export const JsonIdtype = memo(({psmClassIri}: {psmClassIri: string | null | undefined}) => {
    const {t} = useTranslation("detail", {keyPrefix: "json id type"});
    const store = useFederatedObservableStore();

    const {resource: rawResource} = useResource(psmClassIri ?? null);
    const resource = DataPsmClass.is(rawResource) ? rawResource : null;

    const [state, setState] = React.useState<"OPTIONAL" | "REMOVE" | "DEFAULT">("DEFAULT");

    useEffect(() => {
        if (resource) {
            setState(getState(resource));
        }
    }, [resource]);

    const savedState = resource ? getState(resource) : null;

    useSaveHandler(
        resource && savedState !== state,
        async () => resource && store.executeComplexOperation(new SetJsonIdtype(psmClassIri, state))
    )

    return <>
        {resource && <>
            <Box sx={{mb: 3}}>
                <Typography variant="subtitle1" component="h2">
                    {t('title')}
                </Typography>
                <RadioGroup
                    row
                    value={state}
                    onChange={el => setState(el.target.value as "OPTIONAL" | "REMOVE" | "DEFAULT")}
                >
                    <FormControlLabel value="DEFAULT" control={<Radio />} label={t('value.default')} />
                    <FormControlLabel value="OPTIONAL" control={<Radio />} label={t('value.optional')} />
                    <FormControlLabel value="REMOVE" control={<Radio />} label={t('value.remove')} />
                </RadioGroup>
            </Box>
        </>}
    </>
});