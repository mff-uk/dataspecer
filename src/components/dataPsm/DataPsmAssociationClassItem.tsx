import React, {useCallback} from "react";
import EditIcon from "@material-ui/icons/Edit";
import {useToggle} from "../../hooks/useToggle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import {DataPsmClassPartItemProperties, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {DataPsmClassParts} from "./DataPsmClassParts";
import {ActionButton} from "./common/ActionButton";
import {DataPsmClassAddSurroundingsButton} from "./class/DataPsmClassAddSurroundingsButton";
import {IconButton, Typography} from "@material-ui/core";
import AccountTreeTwoToneIcon from '@material-ui/icons/AccountTreeTwoTone';
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {useDataPsm} from "../../hooks/useDataPsm";
import {DataPsmAssociationEnd, DataPsmClass} from "model-driven-data/data-psm/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {PimClass} from "model-driven-data/pim/model";
import {useDialog} from "../../hooks/useDialog";
import {DataPsmAssociationClassDetailDialog} from "./detail/DataPsmAssociationClassDetailDialog";
import {StoreContext} from "../App";
import DeleteIcon from "@material-ui/icons/Delete";

/**
 * This component represents either PSM class or PSM association to a PSM class.
 */
export const DataPsmAssociationClassItem: React.FC<DataPsmClassPartItemProperties> = ({dataPsmResourceIri: dataPsmAssociationEndIri, parentDataPsmClassIri, dragHandleProps, index}) => {
    const {t} = useTranslation("psm");
    const styles = useItemStyles();
    const {deleteAssociationClass} = React.useContext(StoreContext);

    const {dataPsmResource: dataPsmAssociationEnd, isLoading: associationLoading} = useDataPsm<DataPsmAssociationEnd>(dataPsmAssociationEndIri);
    const dataPsmClassIri = dataPsmAssociationEnd?.dataPsmPart ?? null;
    const {dataPsmResource: dataPsmClass, pimResource: pimClass, isLoading: classLoading} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const isLoading = associationLoading || classLoading;

    const collapse = useToggle(true);

    const detail = useDialog(DataPsmAssociationClassDetailDialog, ["dataPsmAssociationIri", "dataPsmClassIri"], {dataPsmAssociationIri: "", dataPsmClassIri: ""});
    const detailOpen = useCallback(() => detail.open({dataPsmAssociationIri: dataPsmAssociationEndIri, dataPsmClassIri: dataPsmClassIri as string}), [dataPsmAssociationEndIri, dataPsmClassIri]);

    const del = useCallback(() => dataPsmAssociationEnd && dataPsmClass && deleteAssociationClass({
        association: dataPsmAssociationEnd,
        child: dataPsmClass,
        ownerClassIri: parentDataPsmClassIri,
    }), [dataPsmAssociationEnd, dataPsmClass, parentDataPsmClassIri]);

    return <li className={styles.li}>
        <Typography className={styles.root}>
            <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />
            {collapse.isOpen ?
                <IconButton size={"small"} onClick={collapse.close}><ExpandMoreIcon /></IconButton> :
                <IconButton size={"small"} onClick={collapse.open}><ExpandLessIcon /></IconButton>
            }
            <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmAssociationEndIri}>
                {(label, description) =>
                    <span {...dragHandleProps} title={description} className={styles.association}>{label}</span>
                }
            </DataPsmGetLabelAndDescription>
            {dataPsmClassIri && <>
                {': '}
                <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmClassIri}>
                    {(label, description) =>
                        <span title={description} className={styles.class}>{label}</span>
                    }
                </DataPsmGetLabelAndDescription>
            </>}

            {' '}

            {!!(dataPsmAssociationEnd?.dataPsmTechnicalLabel && dataPsmAssociationEnd.dataPsmTechnicalLabel.length) &&
            <>(<span className={styles.technicalLabel}>{dataPsmAssociationEnd.dataPsmTechnicalLabel}</span>)</>
            }

            {dataPsmClassIri && <DataPsmClassAddSurroundingsButton dataPsmClassIri={dataPsmClassIri} />}
            {dataPsmAssociationEnd && <>
                <ActionButton onClick={detailOpen} icon={<EditIcon/>} label={t("button edit")} />
                <ActionButton onClick={del} icon={<DeleteIcon/>} label={t("button delete")} />
            </>}
        </Typography>
        {dataPsmClassIri ?
            <DataPsmClassParts dataPsmClassIri={dataPsmClassIri} isOpen={collapse.isOpen}/>
            :
            <>Loading parts</>
        }
        <detail.component />
    </li>;
};
