import React from "react";
import {useItemStyles} from "./PsmItemCommon";
import {DataPsmClassParts} from "./DataPsmClassParts";
import {DataPsmClassAddSurroundingsButton} from "./class/DataPsmClassAddSurroundingsButton";
import {MenuItem, Skeleton} from "@mui/material";
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmClass} from "@model-driven-data/core/lib/data-psm/model";
import {PimClass} from "@model-driven-data/core/lib/pim/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {DataPsmClassDetailDialog} from "../detail/data-psm-class-detail-dialog";
import {useTranslation} from "react-i18next";
import {isReadOnly} from "../../store/federated-observable-store";
import {ItemRow} from "./item-row";
import {useDialog} from "../../dialog";
import {AddInterpretedSurroundingsDialog} from "../add-interpreted-surroundings";
import {Icons} from "../../icons";

export const DataPsmClassItem: React.FC<{dataPsmClassIri: string}> = ({dataPsmClassIri}) => {
    const {t} = useTranslation("psm");
    const styles = useItemStyles();

    const {dataPsmResource: dataPsmClass, dataPsmResourceStore, pimResource: pimClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const readOnly = isReadOnly(dataPsmResourceStore);
    const cimClassIri = pimClass?.pimInterpretation;

    const DetailDialog = useDialog(DataPsmClassDetailDialog, ["iri"]);
    const AddSurroundings = useDialog(AddInterpretedSurroundingsDialog, ["dataPsmClassIri"]);

    return <li className={styles.li}>
        <ItemRow open actions={<>
            {cimClassIri && !readOnly && <DataPsmClassAddSurroundingsButton open={AddSurroundings.open} />}
            {readOnly ?
                <MenuItem onClick={() => DetailDialog.open({})} title={t("button edit")}><Icons.Tree.Info/></MenuItem> :
                <MenuItem onClick={() => DetailDialog.open({})} title={t("button info")}><Icons.Tree.Edit/></MenuItem>
            }
        </>} readOnly={readOnly}>
            {dataPsmClass === undefined && <Skeleton />}
            {dataPsmClass &&
                <>
                    <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmClassIri}>
                        {(label, description) =>
                            <span className={styles.class} title={description}>{label}</span>
                        }
                    </DataPsmGetLabelAndDescription>

                    {typeof dataPsmClass.dataPsmTechnicalLabel === "string" && dataPsmClass.dataPsmTechnicalLabel.length > 0 &&
                        <> (<span className={styles.technicalLabel}>{dataPsmClass.dataPsmTechnicalLabel}</span>)</>
                    }
                </>
            }
        </ItemRow>

        {dataPsmClass && <DataPsmClassParts dataPsmClassIri={dataPsmClassIri} isOpen={true}/>}


        <DetailDialog.Component iri={dataPsmClassIri} />
        <AddSurroundings.Component dataPsmClassIri={dataPsmClassIri} />
    </li>;
};
