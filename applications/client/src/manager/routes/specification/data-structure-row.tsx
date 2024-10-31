import {Box, Button, Card, CardActions, CardContent, TableCell, TableRow, Typography} from "@mui/material";
import React from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";
import {DataSchemaNameCell, selectLanguage} from "../../name-cells";
import {getEditorLink} from "../../shared/get-schema-generator-link";
import {Link} from "react-router-dom";
import {useTranslation} from "react-i18next";

export interface DataStructureRowProps {
    specificationIri: string;
    dataStructureIri: string;
    onDelete: () => void;
}

export const DataStructureRow: React.FC<DataStructureRowProps>
    = ({specificationIri, dataStructureIri, onDelete}) => {

    const {resource} = useResource<DataPsmSchema>(dataStructureIri);

    return <TableRow>
        <TableCell component="th" scope="row" sx={{width: "25%"}}>
            <DataSchemaNameCell dataPsmSchemaIri={dataStructureIri as string} />
        </TableCell>
        <TableCell>
            <Typography>{resource?.dataPsmParts.length ?? "-"}</Typography>
        </TableCell>

        <TableCell align="right">
            <Box
                sx={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end"
                }}>
                <Button
                    variant={"contained"}
                    color={"primary"}
                    component={Link}
                    to={getEditorLink(specificationIri, dataStructureIri)}
                >
                    Edit
                </Button>
                <Button
                    variant="outlined"
                    color={"error"}
                    onClick={onDelete}>Delete</Button>
            </Box>
        </TableCell>
    </TableRow>;
};

export const DataStructureBox: React.FC<DataStructureRowProps>
    = ({specificationIri, dataStructureIri, onDelete}) => {
    const {t} = useTranslation("ui");

    const {resource} = useResource<DataPsmSchema>(dataStructureIri);

    return <Card variant="outlined" sx={{height: "4.75cm"}}>
        <CardContent>
            <Typography variant="h5" component="div" sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}>
                {selectLanguage(resource?.dataPsmHumanLabel ?? {}, ["en"]) ?? dataStructureIri}
                {resource?.dataPsmTechnicalLabel && <span style={{fontFamily: "monospace", fontSize: ".8rem", marginLeft: ".5rem"}}>({resource.dataPsmTechnicalLabel})</span>}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {t("data structure")}
            </Typography>
            <Typography variant="body2">{resource?.dataPsmParts.length ?? "-"} items</Typography>
        </CardContent>
        <CardActions>
            <div style={{flexGrow: 1}} />
            <Button color="error" onClick={onDelete} sx={{mr: 1}}>
                {t("delete")}
            </Button>
            <Button component={Link} to={getEditorLink(specificationIri, dataStructureIri)} variant={"outlined"}>
                {t("open data structure")}
            </Button>
        </CardActions>
    </Card>;
};
