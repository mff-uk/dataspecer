import React, {useCallback} from "react";
import {Typography} from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import {useToggle} from "../../hooks/useToggle";
import {DataPsmClassPartItemProperties, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {DataPsmDeleteButton} from "./class/DataPsmDeleteButton";
import {ActionButton} from "./common/ActionButton";
import RemoveIcon from '@material-ui/icons/Remove';
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmAttribute, DataPsmClass} from "model-driven-data/data-psm/model";
import classNames from "classnames";
import {PimAttribute} from "model-driven-data/pim/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {StoreContext} from "../App";
import {useDataPsm} from "../../hooks/useDataPsm";
import {DataPsmAttributeDetailDialog} from "./detail/DataPsmAttributeDetailDialog";
import {InlineEdit} from "./common/InlineEdit";

export const DataPsmAttributeItem: React.FC<DataPsmClassPartItemProperties> = ({dataPsmResourceIri: dataPsmAttributeIri, dragHandleProps, parentDataPsmClassIri, index}) => {
    const {dataPsmResource: dataPsmAttribute, pimResource: pimAttribute, isLoading} = useDataPsmAndInterpretedPim<DataPsmAttribute, PimAttribute>(dataPsmAttributeIri);
    const dialog = useToggle();
    const {t} = useTranslation("psm");
    const styles = useItemStyles();

    const {deleteAttribute} = React.useContext(StoreContext);
    const {dataPsmResource: ownerClass} = useDataPsm<DataPsmClass>(parentDataPsmClassIri);
    const del = useCallback(() => dataPsmAttribute && ownerClass && deleteAttribute({
        attribute: dataPsmAttribute,
        ownerClass,
    }), [dataPsmAttribute, ownerClass]);

    const inlineEdit = useToggle();

    return <>
        <li className={classNames(styles.li, {[styles.loading]: isLoading})}>
            {dataPsmAttribute &&
                <Typography className={styles.root}>
                    <RemoveIcon style={{verticalAlign: "middle"}} />
                    {' '}
                    <span {...dragHandleProps} onDoubleClick={inlineEdit.open}>
                        <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmAttributeIri}>
                            {(label, description) =>
                                <span title={description} className={styles.attribute}>{label}</span>
                            }
                        </DataPsmGetLabelAndDescription>

                        {inlineEdit.isOpen ? <>
                            <InlineEdit close={inlineEdit.close}  dataPsmResource={dataPsmAttribute} resourceType={"attribute"}/>
                        </> : <>
                            {!!(dataPsmAttribute?.dataPsmTechnicalLabel && dataPsmAttribute.dataPsmTechnicalLabel.length) &&
                                <> (<span className={styles.technicalLabel}>{dataPsmAttribute.dataPsmTechnicalLabel}</span>)</>
                            }

                            {dataPsmAttribute?.dataPsmDatatype && dataPsmAttribute.dataPsmDatatype.length && <>
                                {': '}
                                <span className={styles.type}>{dataPsmAttribute.dataPsmDatatype}</span>
                            </>}
                        </>}
                    </span>

                    {inlineEdit.isOpen || <>
                        <ActionButton onClick={dialog.open} icon={<EditIcon/>} label={t("button edit")}/>
                        {parentDataPsmClassIri && index !== undefined && <DataPsmDeleteButton onClick={del} />}
                    </>}
                </Typography>
            }
        </li>

        <DataPsmAttributeDetailDialog dataPsmAttributeIri={dataPsmAttributeIri} isOpen={dialog.isOpen} close={dialog.close} />
    </>;
};
