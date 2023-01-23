import {
    Box, Button,
    Card, CardContent, Collapse,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import React, {FC, useCallback, useContext, useState} from "react";
import {DataSpecificationsContext} from "../../app";
import {BackendConnectorContext} from "../../../application";
import {DataSpecifications} from "../../data-specifications";
import {useSnackbar} from "notistack";

interface ConceptualModelSourcesProps {
    dataSpecificationIri: string;
}

interface ConceptualModelSourcesWithDataProps {
    dataSpecificationIri: string;
    dataSpecification: DataSpecifications[keyof DataSpecifications];
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

const ConceptualModelSourcesWithData: FC<ConceptualModelSourcesWithDataProps> = ({dataSpecificationIri, dataSpecification}) => {
    const {dataSpecifications, setDataSpecifications} = useContext(DataSpecificationsContext);
    const backendConnector = useContext(BackendConnectorContext);
    const {enqueueSnackbar} = useSnackbar();

    const [radio, setRadio] = useState((dataSpecification.cimAdapters?.length ?? 0) === 0 ? "sgov" : "files");
    const [urls, setUrls] = useState(dataSpecification.cimAdapters ?? []);

    const handleSave = useCallback(async () => {
        const cimAdapters = radio === "sgov" ? [] : urls.filter(url => url.length > 0);
        const newSpecification = await backendConnector.updateDataSpecification(dataSpecificationIri, {cimAdapters});
        setDataSpecifications({...dataSpecifications, [newSpecification.iri]: newSpecification});
        enqueueSnackbar("Sources configuration saved", {variant: "success"});
    }, [radio, urls, backendConnector, dataSpecificationIri, setDataSpecifications, dataSpecifications, enqueueSnackbar])

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
                            <FormControlLabel value="sgov" control={<Radio />} label="slovník.gov.cz" />
                            <FormControlLabel value="files" control={<Radio />} label="RDF files" />
                        </RadioGroup>
                    </FormControl>

                    <div style={{flexGrow: 1}} />

                    <div>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </div>
                </Box>

                <Collapse in={radio === "files"}>
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
            </CardContent>
        </Card>
    </>;
}
