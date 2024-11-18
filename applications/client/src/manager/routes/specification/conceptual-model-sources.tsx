import { LOCAL_SEMANTIC_MODEL } from "@dataspecer/core-v2/model/known-models";
import {
    Box, Button,
    Card, CardContent, Checkbox, Chip, Collapse,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import { useSnackbar } from "notistack";
import { FC, useCallback, useContext, useState } from "react";
import { BackendConnectorContext } from "../../../application";
import { DataSpecification } from "../../../specification";
import { DataSpecificationsContext } from "../../app";
import { selectLanguage } from "../../name-cells";

interface ConceptualModelSourcesProps {
    dataSpecificationIri: string;
}

interface ConceptualModelSourcesWithDataProps {
    dataSpecificationIri: string;
    dataSpecification: DataSpecification;
}

export const ConceptualModelSources: FC<ConceptualModelSourcesProps> = (props) => {
    const {dataSpecifications} = useContext(DataSpecificationsContext);

    const specification = dataSpecifications[props.dataSpecificationIri];

    if (specification) {
        return <ConceptualModelSourcesWithData
            dataSpecificationIri={props.dataSpecificationIri}
            dataSpecification={specification}
        />
    } else {
        return null;
    }
}

const WIKIDATA_ADAPTER = "https://dataspecer.com/adapters/wikidata";
const SGOV_EN_ADAPTER = "https://dataspecer.com/adapters/sgov-en";

function sourceSemanticModelsToHooks(sourceSemanticModels: string[]): [string, string[], string[]] {
    if (sourceSemanticModels.length === 0 || (sourceSemanticModels.length === 1 && sourceSemanticModels[0].startsWith("https://dataspecer.com/adapters/"))) {
        return [sourceSemanticModels[0], [], []];
    }
    if (sourceSemanticModels.every(iri => iri.startsWith("rdfs:"))) {
        return ["__files", sourceSemanticModels.map(iri => iri.substring("rdfs:".length)), []];
    }
    return ["__models", [], sourceSemanticModels];
}

function hooksToSourceSemanticModels(radio: string, urls: string[], selectedModels: string[]): string[] {
    if (radio === "__files") {
        return urls.map(url => "rdfs:" + url);
    }
    if (radio === "__models") {
        return selectedModels;
    }
    return [radio];
}

const ConceptualModelSourcesWithData: FC<ConceptualModelSourcesWithDataProps> = ({dataSpecificationIri, dataSpecification}) => {
    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const backendPackageService = useContext(BackendConnectorContext);
    const {enqueueSnackbar} = useSnackbar();

    const adapters = dataSpecification.sourceSemanticModelIds ?? [];

    const [defaultRadio, defaultFiles, defaultModels] = sourceSemanticModelsToHooks(adapters);

    const [radio, setRadio] = useState(defaultRadio);
    const [urls, setUrls] = useState(defaultFiles);
    const [selectedModels, setSelectedModels] = useState<string[]>(defaultModels);

    const handleSave = useCallback(async () => {
        const newAdapters = hooksToSourceSemanticModels(radio, urls, selectedModels);
        await backendPackageService.updateSourceSemanticModelIds(dataSpecification.iri, newAdapters);
        setDataSpecifications({...dataSpecifications, [dataSpecification.iri]: {
            ...dataSpecification,
            sourceSemanticModelIds: newAdapters
        }});
        enqueueSnackbar("Sources configuration saved", {variant: "success"});
    }, [radio, urls, selectedModels, backendPackageService, dataSpecification, dataSpecifications, enqueueSnackbar, setDataSpecifications]);

    return <>
        <Typography variant="h5" component="div" gutterBottom sx={{mt: 5}}>
            Vocabulary sources
        </Typography>

        <Card  sx={{mt: 3}}>
            <CardContent>
                <Box sx={{display: "flex"}}>
                    <FormControl>
                        <FormLabel>Source type</FormLabel>
                        <RadioGroup
                            value={radio}
                            onChange={event => setRadio(event.target.value)}
                            row
                        >
                            <FormControlLabel value="https://dataspecer.com/adapters/sgov" control={<Radio />} label="slovník.gov.cz" />
                            <FormControlLabel value={SGOV_EN_ADAPTER} control={<Radio />} label="slovník.gov.cz translated to English" />
                            <FormControlLabel value="__files" control={<Radio />} label="RDF files" />
                            <FormControlLabel value={WIKIDATA_ADAPTER} control={<Radio />} label={<>Wikidata <Chip label="experimental" variant="outlined" color="warning" size="small" /></>} />
                            <FormControlLabel value="__models" control={<Radio />} label="Model(s) from data specification" />
                        </RadioGroup>
                    </FormControl>

                    <div style={{flexGrow: 1}} />

                    <div>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </div>
                </Box>

                <Collapse in={radio === "__files"}>
                    <TextField
                        label="URLs of sources"
                        multiline
                        minRows={4}
                        variant="outlined"
                        sx={{mt: 3}}

                        fullWidth

                        disabled={radio !== "files"}
                        value={urls.join("\n")}
                        onChange={event => setUrls(event.target.value.split("\n"))}
                    />
                </Collapse>

                <Collapse in={radio === "__models"}>
                    <FormGroup>
                        {dataSpecification.subResources.filter(resource => resource.types.includes(LOCAL_SEMANTIC_MODEL)).map(resource => <FormControlLabel
                            key={resource.iri}
                            control={<Checkbox checked={selectedModels.includes(resource.iri)} onChange={
                                event => setSelectedModels(event.target.checked ? [...selectedModels, resource.iri] : selectedModels.filter(iri => iri !== resource.iri))
                            } />}
                            label={selectLanguage(resource.userMetadata?.label, ["en"]) ?? resource.iri}
                        />)}
                    </FormGroup>
                </Collapse>
            </CardContent>
        </Card>
    </>;
}
