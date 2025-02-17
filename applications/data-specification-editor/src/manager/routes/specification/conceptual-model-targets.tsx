import { LOCAL_SEMANTIC_MODEL } from "@dataspecer/core-v2/model/known-models";
import {
    Alert,
    Box, Button,
    Card, CardContent, Checkbox,
    FormControlLabel,
    FormGroup,
    Radio,
    RadioGroup,
    Typography
} from "@mui/material";
import { useSnackbar } from "notistack";
import { FC, useCallback, useContext, useState } from "react";
import { BackendConnectorContext } from "../../../application";
import { DataSpecification } from "@dataspecer/backend-utils/connectors/specification";
import { DataSpecificationsContext } from "../../app";
import { selectLanguage } from "../../name-cells";
import { ModelCompositionConfigurationApplicationProfile, ModelCompositionConfigurationMerge } from "../../../editor/configuration/configuration";


interface ConceptualModelTargetsProps {
    dataSpecificationIri: string;
}

export const ConceptualModelTargets: FC<ConceptualModelTargetsProps> = ({dataSpecificationIri}) => {
    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[dataSpecificationIri];

    if (specification) {
        return <Inner specification={specification} />;
    } else {
        return null;
    }
}


const Inner = ({specification}: {specification: DataSpecification}) => {
    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const backendPackageService = useContext(BackendConnectorContext);

    const {enqueueSnackbar} = useSnackbar();

    const mainProfile = (specification?.modelCompositionConfiguration ?? null) as ModelCompositionConfigurationApplicationProfile;

    const [selectedModel, setSelectedModel] = useState<string | null>((mainProfile?.model ?? null) as string);

    const handleSave = useCallback(async () => {
        const newConfiguration = {
            modelType: "application-profile",
            model: selectedModel,
            profiles: {
                modelType: "merge",
                models: null
            } as ModelCompositionConfigurationMerge,
        } satisfies ModelCompositionConfigurationApplicationProfile;
        await backendPackageService.updateDefaultModelCompositionConfiguration(specification.id, newConfiguration);
        setDataSpecifications({
            ...dataSpecifications,
            [specification.id]: {
                ...specification,
                modelCompositionConfiguration: newConfiguration,
            },
        });
        enqueueSnackbar("Targets configuration saved", {variant: "success"});
    }, [backendPackageService, specification, setDataSpecifications, dataSpecifications, enqueueSnackbar, selectedModel]);

    return <>
        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Source configuration
        </Typography>

        <Alert severity="info" sx={{mt: 3}}>Select the model with application profile that will be used for structure modeling.</Alert>

        <Card  sx={{mt: 3}}>
            <CardContent>
                <Box sx={{display: "flex"}}>
                    <RadioGroup value={selectedModel} onChange={event => setSelectedModel(event.target.value)}>
                        {specification?.subResources.filter(resource => resource.types.includes(LOCAL_SEMANTIC_MODEL)).map(resource => <FormControlLabel
                            key={resource.iri}
                            control={<Radio value={resource.iri} />}
                            label={selectLanguage(resource.userMetadata?.label, ["en"]) ?? resource.iri}
                        />)}
                    </RadioGroup>

                    <div style={{flexGrow: 1}} />

                    <div>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </div>
                </Box>

            </CardContent>
        </Card>
    </>;
}