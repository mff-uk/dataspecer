import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DataSpecificationsContext } from "../../app";
import { selectLanguage } from "../../name-cells";
import { getEditorLink } from "../../shared/get-schema-generator-link";

export interface DataStructureRowProps {
    specificationIri: string;
    dataStructureIri: string;
    onDelete: () => void;
}

export const DataStructureBox: React.FC<DataStructureRowProps>
    = ({specificationIri, dataStructureIri, onDelete}) => {
    const {t} = useTranslation("ui");

    const {dataSpecifications} = useContext(DataSpecificationsContext);
    const specification = dataSpecifications[specificationIri as string];
    const dataStructure = specification?.dataStructures.find(structure => structure.id === dataStructureIri);

    return <Card variant="outlined" sx={{height: "4.75cm"}}>
        <CardContent>
            <Typography variant="h5" component="div" sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}>
                {selectLanguage(dataStructure?.label ?? {}, ["en"]) ?? dataStructureIri}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {t("data structure")}
            </Typography>
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
