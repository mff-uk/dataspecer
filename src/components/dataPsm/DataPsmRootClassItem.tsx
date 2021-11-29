import React from "react";
import {useItemStyles} from "./PsmItemCommon";
import {DataPsmClassParts} from "./DataPsmClassParts";
import {DataPsmClassAddSurroundingsButton} from "./class/DataPsmClassAddSurroundingsButton";
import {Skeleton, Typography} from "@mui/material";
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmClass} from "model-driven-data/data-psm/model";
import {PimClass} from "model-driven-data/pim/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {ActionButton} from "./common/ActionButton";
import EditIcon from "@mui/icons-material/Edit";
import {useDialog} from "../../hooks/useDialog";
import {DataPsmClassDetailDialog} from "../detail/data-psm-class-detail-dialog";
import {useTranslation} from "react-i18next";
import {isReadOnly} from "../../store/federated-observable-store";

export const DataPsmRootClassItem: React.FC<{dataPsmClassIri: string}> = ({dataPsmClassIri}) => {
    const styles = useItemStyles();

    const {dataPsmResource: dataPsmClass, dataPsmResourceStore, pimResource: pimClass, isLoading} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const readOnly = isReadOnly(dataPsmResourceStore);
    const cimClassIri = pimClass?.pimInterpretation;

    const detailDialog = useDialog(DataPsmClassDetailDialog, [], {});
    const {t} = useTranslation("psm");


    return <li className={styles.li}>
        <Typography className={styles.root}>
            {dataPsmClass === undefined && <Skeleton />}
            {dataPsmClass &&
                <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmClassIri}>
                    {(label, description) =>
                        <span className={styles.class} title={description}>{label}</span>
                    }
                </DataPsmGetLabelAndDescription>
            }
            {cimClassIri && !readOnly && <DataPsmClassAddSurroundingsButton dataPsmClassIri={dataPsmClassIri} />}
            <ActionButton onClick={() => detailDialog.open({})} icon={<EditIcon/>} label={t("button edit")}/>
        </Typography>

        {dataPsmClass && <DataPsmClassParts dataPsmClassIri={dataPsmClassIri} isOpen={true}/>}
        <detailDialog.component iri={dataPsmClassIri} />
    </li>;
};
