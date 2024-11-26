import React, {useContext, useMemo} from "react";
import {ImportData} from "./dialog";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {PimSchema} from "@dataspecer/core/pim/model";
import {selectLanguage} from "../name-cells";
import {Chip} from "@mui/material";
import {DataSpecificationsContext} from "../app";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import {FullDataSpecification} from "../data-specifications";
import { useTranslation } from "react-i18next";


export const SelectionWindow = ({importData, dataSpecificationsToImport, setDataSpecificationsToImport, requiredSpecifications}: { importData: ImportData, dataSpecificationsToImport: string[], setDataSpecificationsToImport: (value: string[]) => void, requiredSpecifications: string[]}) => {
    const dataSpecifications = useMemo(() => Object.values(importData.dataSpecifications), [importData.dataSpecifications]);
    const {t} = useTranslation("ui", {keyPrefix: 'import'});

    return <>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{t("data specification")}</TableCell>
                        <TableCell>{t("exists locally")}</TableCell>
                        <TableCell align="right">{t("action")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataSpecifications.map((dataSpecification) => <Row
                        key={dataSpecification.iri}
                        dataSpecification={dataSpecification}
                        importData={importData}
                        dataSpecificationsToImport={dataSpecificationsToImport}
                        setDataSpecificationsToImport={setDataSpecificationsToImport}
                        requiredSpecifications={requiredSpecifications}
                    />)}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
}

const Row = (props: {key: string, dataSpecification: FullDataSpecification, importData: ImportData, dataSpecificationsToImport: string[], setDataSpecificationsToImport: (value: string[]) => void, requiredSpecifications: string[] }) => {
    const {dataSpecifications: localDS} = useContext(DataSpecificationsContext);
    const exists = !!localDS[props.dataSpecification.iri];
    const forceEnable = props.requiredSpecifications.includes(props.dataSpecification.iri) && !props.dataSpecificationsToImport.includes(props.dataSpecification.iri) && !exists;
    const {t} = useTranslation("ui", {keyPrefix: 'import'});

    return <TableRow
        key={props.key}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
        <TableCell component="th" scope="row">
            <div>
                {selectLanguage((props.importData.mergedStore[props.dataSpecification.pim] as PimSchema).pimHumanLabel, ["en"])}
            </div>
            <div>
                {props.dataSpecification.tags?.map(tag => <Chip size='small' label={tag} />)}
            </div>
        </TableCell>
        <TableCell>{exists ? <Chip color="success" size="small" icon={<CheckIcon />} label={"existuje"} /> : <Chip color="error" size="small" icon={<CloseIcon />} label={"neexistuje"} />}</TableCell>
        <TableCell align="right">
            <FormControl>
                <RadioGroup row
                    value={(props.dataSpecificationsToImport.includes(props.dataSpecification.iri) || forceEnable) ? "WRITE" : "IGNORE"}
                    onChange={(event) => {
                        if (event.target.value === "WRITE") {
                            props.setDataSpecificationsToImport([...props.dataSpecificationsToImport, props.dataSpecification.iri]);
                        } else {
                            props.setDataSpecificationsToImport(props.dataSpecificationsToImport.filter(iri => iri !== props.dataSpecification.iri));
                        }
                    }}
                >
                    <FormControlLabel value="WRITE" control={<Radio />} label={exists ? t("overwrite") : t("create")} />
                    <FormControlLabel value="IGNORE" control={<Radio />} label={exists ? t("overwrite-not") : t("create-not")} disabled={forceEnable} />
                </RadioGroup>
            </FormControl>
        </TableCell>
    </TableRow>
}