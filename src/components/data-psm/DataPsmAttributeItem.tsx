import React, {memo, useCallback} from "react";
import {useToggle} from "../../hooks/useToggle";
import {DataPsmClassPartItemProperties, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {DataPsmDeleteButton} from "./class/DataPsmDeleteButton";
import RemoveIcon from '@mui/icons-material/Remove';
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmAttribute, DataPsmClass} from "model-driven-data/data-psm/model";
import classNames from "classnames";
import {StoreContext} from "../App";
import {DataPsmAttributeDetailDialog} from "../detail/data-psm-attribute-detail-dialog";
import {InlineEdit} from "./common/InlineEdit";
import {useResource} from "../../hooks/useResource";
import {DeleteAttribute} from "../../operations/delete-attribute";
import {Datatype} from "./common/Datatype";
import {isReadOnly} from "../../store/federated-observable-store";
import {ItemRow} from "./item-row";
import {MenuItem} from "@mui/material";
import {Icons} from "../../icons";

export const DataPsmAttributeItem: React.FC<DataPsmClassPartItemProperties> = memo(({dataPsmResourceIri: dataPsmAttributeIri, dragHandleProps, parentDataPsmClassIri, index}) => {
    //const {dataPsmResource: dataPsmAttribute, pimResource: pimAttribute, isLoading} = useDataPsmAndInterpretedPim<DataPsmAttribute, PimAttribute>(dataPsmAttributeIri);
    const {resource: dataPsmAttribute, isLoading, store: dataPsmAttributeStore} = useResource<DataPsmAttribute>(dataPsmAttributeIri);
    const readOnly = isReadOnly(dataPsmAttributeStore);

    const dialog = useToggle();
    const {t} = useTranslation("psm");
    const styles = useItemStyles();

    const {store} = React.useContext(StoreContext);
    const {resource: ownerClass} = useResource<DataPsmClass>(parentDataPsmClassIri);
    const del = useCallback(() => dataPsmAttribute && ownerClass && store.executeOperation(new DeleteAttribute(dataPsmAttribute, ownerClass)), [dataPsmAttribute, ownerClass]);

    const inlineEdit = useToggle();

    return <>
        <li className={classNames(styles.li, {[styles.loading]: isLoading})}>
            <ItemRow actions={inlineEdit.isOpen || <>
                <MenuItem onClick={dialog.open} title={t("button edit")}><Icons.Tree.Edit/></MenuItem>
                {readOnly ||
                    (parentDataPsmClassIri && index !== undefined && <DataPsmDeleteButton onClick={del} />)
                }
            </>} open>
                {dataPsmAttribute &&
                    <>
                        <RemoveIcon style={{verticalAlign: "middle"}} />
                        {' '}
                        <span {...dragHandleProps} onDoubleClick={readOnly ? () => null : inlineEdit.open}>
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
                                    {' : '}
                                    <Datatype iri={dataPsmAttribute.dataPsmDatatype} className={styles.type} />
                                </>}
                            </>}
                        </span>
                    </>
                }

            </ItemRow>
        </li>

        <DataPsmAttributeDetailDialog iri={dataPsmAttributeIri} isOpen={dialog.isOpen} close={dialog.close} />
    </>;
});
