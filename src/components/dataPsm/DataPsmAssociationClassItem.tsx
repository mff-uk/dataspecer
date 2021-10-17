import React, {useCallback, useMemo} from "react";
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
import {DataPsmAssociationEnd, DataPsmClass} from "model-driven-data/data-psm/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {PimAssociation, PimAssociationEnd, PimClass} from "model-driven-data/pim/model";
import {useDialog} from "../../hooks/useDialog";
import {DataPsmAssociationClassDetailDialog} from "./detail/DataPsmAssociationClassDetailDialog";
import {StoreContext} from "../App";
import DeleteIcon from "@material-ui/icons/Delete";
import {InlineEdit} from "./common/InlineEdit";
import {LanguageString} from "model-driven-data/core";
import {useAsyncMemo} from "../../hooks/useAsyncMemo";
import {LanguageStringUndefineable} from "../helper/LanguageStringComponents";
import {DeleteAssociationClass} from "../../operations/delete-association-class";

// todo This hook is just temporary until we fix problem with accessing the association from its association end.
const usePimAssociationFromPimAssociationEnd = (pimAssociationEndIri: string | null) => {
    const {store} = React.useContext(StoreContext);

    return useAsyncMemo<PimAssociation | null>(async () => {
        if (pimAssociationEndIri) {
            const resources = await store.listResources();
            for (const resourceIri of resources) {
                const resource = await store.readResource(resourceIri);
                if (PimAssociation.is(resource)) {
                    if (resource.pimEnd.includes(pimAssociationEndIri)) {
                        return resource;
                    }
                }
            }
        }
        return null;
    }, [pimAssociationEndIri]);
}

/**
 * This component represents either PSM class or PSM association to a PSM class.
 *
 * **Data PSM association end** interprets **PIM association end** which belongs to **PIM association**.
 */
export const DataPsmAssociationClassItem: React.FC<DataPsmClassPartItemProperties> = ({dataPsmResourceIri: dataPsmAssociationEndIri, parentDataPsmClassIri, dragHandleProps, index}) => {
    const {t} = useTranslation("psm");
    const styles = useItemStyles();
    const {store} = React.useContext(StoreContext);

    // Association ends
    const {
        dataPsmResource: dataPsmAssociationEnd,
        pimResource: pimAssociationEnd,
        isLoading: associationLoading
    } = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(dataPsmAssociationEndIri);

    // PIM Association and check if it is backward association

    const [pimAssociation, pimAssociationIsLoading] = usePimAssociationFromPimAssociationEnd(pimAssociationEnd?.iri ?? null);
    const isBackwardsAssociation = useMemo(() => pimAssociation && pimAssociation.pimEnd[0] === pimAssociationEnd?.iri, [pimAssociation, pimAssociationEnd]);

    const dataPsmClassIri = dataPsmAssociationEnd?.dataPsmPart ?? null;
    const {dataPsmResource: dataPsmClass, pimResource: pimClass, isLoading: classLoading} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const isLoading = associationLoading || classLoading;

    const collapse = useToggle(true);

    const detail = useDialog(DataPsmAssociationClassDetailDialog, ["dataPsmAssociationIri", "dataPsmClassIri"], {dataPsmAssociationIri: "", dataPsmClassIri: ""});
    const detailOpen = useCallback(() => detail.open({dataPsmAssociationIri: dataPsmAssociationEndIri, dataPsmClassIri: dataPsmClassIri as string}), [dataPsmAssociationEndIri, dataPsmClassIri]);

    const del = useCallback(() => dataPsmAssociationEnd && dataPsmClass &&
            store.executeOperation(new DeleteAssociationClass(dataPsmAssociationEnd, dataPsmClass, parentDataPsmClassIri)),
        [dataPsmAssociationEnd, dataPsmClass, parentDataPsmClassIri]);

    const inlineEdit = useToggle();

    // We need to decide whether there is a human label on DPSM association end or PIM association end.
    // If no, we show a label of PIM association with extra information about the direction.

    const associationEndHumanLabel: LanguageString = useMemo(() => ({...pimAssociationEnd?.pimHumanLabel, ...dataPsmAssociationEnd?.dataPsmHumanLabel}), [pimAssociationEnd?.pimHumanLabel, dataPsmAssociationEnd?.dataPsmHumanLabel]);
    const hasHumanLabelOnAssociationEnd = Object.keys(associationEndHumanLabel).length > 0;


    return <li className={styles.li}>
        <Typography className={styles.root}>
            <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />
            {collapse.isOpen ?
                <IconButton size={"small"} onClick={collapse.close}><ExpandMoreIcon /></IconButton> :
                <IconButton size={"small"} onClick={collapse.open}><ExpandLessIcon /></IconButton>
            }
            <span {...dragHandleProps} onDoubleClick={inlineEdit.open}>
                {hasHumanLabelOnAssociationEnd ?
                    <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmAssociationEndIri}>
                        {(label, description) =>
                            <span title={description} className={styles.association}>{label}</span>
                        }
                    </DataPsmGetLabelAndDescription>
                :
                    <LanguageStringUndefineable from={pimAssociation?.pimHumanLabel ?? null}>
                        {label =>
                            <LanguageStringUndefineable from={pimAssociation?.pimHumanDescription ?? null}>
                                {description => <>
                                    {isBackwardsAssociation && <strong>{t("backwards association")}{" "}</strong>}
                                    <span title={description} className={styles.association}>{label}</span>
                                </>}
                            </LanguageStringUndefineable>
                        }
                    </LanguageStringUndefineable>
                }
                {dataPsmClassIri && <>
                    {': '}
                    <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmClassIri}>
                        {(label, description) =>
                            <span title={description} className={styles.class}>{label}</span>
                        }
                    </DataPsmGetLabelAndDescription>
                </>}

                {inlineEdit.isOpen ?
                    (dataPsmAssociationEnd && <InlineEdit close={inlineEdit.close} dataPsmResource={dataPsmAssociationEnd} resourceType={"associationEnd"} />)
                : <>
                    {' '}

                    {!!(dataPsmAssociationEnd?.dataPsmTechnicalLabel && dataPsmAssociationEnd.dataPsmTechnicalLabel.length) &&
                    <>(<span className={styles.technicalLabel}>{dataPsmAssociationEnd.dataPsmTechnicalLabel}</span>)</>
                    }
                </>}
            </span>

            {inlineEdit.isOpen || <>
                {dataPsmClassIri && <DataPsmClassAddSurroundingsButton dataPsmClassIri={dataPsmClassIri} />}
                {dataPsmAssociationEnd && <>
                    <ActionButton onClick={detailOpen} icon={<EditIcon/>} label={t("button edit")} />
                    <ActionButton onClick={del} icon={<DeleteIcon/>} label={t("button delete")} />
                </>}
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
