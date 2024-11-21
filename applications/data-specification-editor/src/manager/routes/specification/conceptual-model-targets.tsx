import { LOCAL_SEMANTIC_MODEL } from "@dataspecer/core-v2/model/known-models";
import {
    Alert,
    Box, Button,
    Card, CardContent, Checkbox,
    FormControlLabel,
    FormGroup,
    Typography
} from "@mui/material";
import { useSnackbar } from "notistack";
import { FC, useCallback, useContext, useState } from "react";
import { BackendConnectorContext } from "../../../application";
import { DataSpecification } from "../../../specification";
import { DataSpecificationsContext } from "../../app";
import { selectLanguage } from "../../name-cells";


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

    const [selectedModels, setSelectedModels] = useState<string[]>(specification.localSemanticModelIds);

    const handleSave = useCallback(async () => {
        await backendPackageService.updateLocalSemanticModelIds(specification.id, selectedModels);
        setDataSpecifications({
            ...dataSpecifications,
            [specification.id]: {
                ...specification,
                localSemanticModelIds: selectedModels,
            },
        });
        enqueueSnackbar("Targets configuration saved", {variant: "success"});
    }, [backendPackageService, specification, setDataSpecifications, dataSpecifications, enqueueSnackbar, selectedModels]);

    return <>
        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Vocabulary targets
        </Typography>

        <Alert severity="info" sx={{mt: 3}}>Specify the model into which the concepts from the source model will be copied and any changes will be saved.</Alert>

        <Card  sx={{mt: 3}}>
            <CardContent>
                <Box sx={{display: "flex"}}>
                    <FormGroup>
                        {specification?.subResources.filter(resource => resource.types.includes(LOCAL_SEMANTIC_MODEL)).map(resource => <FormControlLabel
                            key={resource.iri}
                            control={<Checkbox checked={selectedModels.includes(resource.iri)} onChange={
                                event => setSelectedModels(event.target.checked ? [...selectedModels, resource.iri] : selectedModels.filter(iri => iri !== resource.iri))
                            } />}
                            label={selectLanguage(resource.userMetadata?.label, ["en"]) ?? resource.iri}
                        />)}
                    </FormGroup>

                    <div style={{flexGrow: 1}} />

                    <div>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </div>
                </Box>

            </CardContent>
        </Card>
    </>;
}