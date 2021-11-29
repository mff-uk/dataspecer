import React, {memo, useCallback, useMemo} from "react";
import EditIcon from "@mui/icons-material/Edit";
import {useToggle} from "../../hooks/useToggle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {DataPsmClassPartItemProperties, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {DataPsmClassParts} from "./DataPsmClassParts";
import {ActionButton} from "./common/ActionButton";
import {DataPsmClassAddSurroundingsButton} from "./class/DataPsmClassAddSurroundingsButton";
import {IconButton, Typography} from "@mui/material";
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmAssociationEnd, DataPsmClass, DataPsmClassReference} from "model-driven-data/data-psm/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/useDataPsmAndInterpretedPim";
import {PimAssociationEnd, PimClass} from "model-driven-data/pim/model";
import {useDialog} from "../../hooks/useDialog";
import {DataPsmAssociationToClassDetailDialog} from "../detail/data-psm-association-to-class-detail-dialog";
import {StoreContext} from "../App";
import DeleteIcon from "@mui/icons-material/Delete";
import {InlineEdit} from "./common/InlineEdit";
import {LanguageString} from "model-driven-data/core";
import {LanguageStringUndefineable} from "../helper/LanguageStringComponents";
import {DeleteAssociationClass} from "../../operations/delete-association-class";
import {usePimAssociationFromPimAssociationEnd} from "./use-pim-association-from-pim-association-end";
import {useResource} from "../../hooks/useResource";
import {usePimExtends} from "../../hooks/usePimExtends";
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import {ReplaceAssociationEndWithReference} from "./replace-association-with-reference/replace-association-end-with-reference";

/**
 * This component handles rendering of data PSM association end item in the tree representation.
 *
 * Because the association end itself is not that interesting, this component also renders the class
 * or class reference the association end points to. Class reference is a reference to another class
 * and again, the class reference itself is not so so interesting, therefore the class is shown.
 */
export const DataPsmAssociationEndItem: React.FC<DataPsmClassPartItemProperties> = memo(({dataPsmResourceIri: dataPsmAssociationEndIri, parentDataPsmClassIri, dragHandleProps, index}) => {
    const {t} = useTranslation("psm");
    const styles = useItemStyles();
    const {store} = React.useContext(StoreContext);

    // association end

    const {dataPsmResource: dataPsmAssociationEnd, pimResource: pimAssociationEnd, isLoading: associationLoading} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(dataPsmAssociationEndIri);

    // PIM Association and check if it is backward association

    const {resource: pimAssociation, isLoading: pimAssociationIsLoading} = usePimAssociationFromPimAssociationEnd(pimAssociationEnd?.iri ?? null);
    const isBackwardsAssociation = useMemo(() => pimAssociation && pimAssociation.pimEnd[0] === pimAssociationEnd?.iri, [pimAssociation, pimAssociationEnd]);

    // range class or range class reference with class

    const associationPointsToIri = dataPsmAssociationEnd?.dataPsmPart ?? null;
    const {resource: associationPointsTo, isLoading: associationPointsToIsLoading} = useResource(associationPointsToIri);
    // Whether the association points to a class reference or just a normal class
    const isClassReference = associationPointsTo && DataPsmClassReference.is(associationPointsTo);

    const dataPsmClassIri = isClassReference ? associationPointsTo.dataPsmSpecification : associationPointsToIri;
    const {dataPsmResource: dataPsmClass, pimResource: pimClass, isLoading: classLoading} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);

    // Process extends of range class
    const ancestorsOfRange = usePimExtends(pimClass?.iri ?? null);
    const isCiselnik = Object.values(ancestorsOfRange).some(cls => cls.resource?.pimInterpretation === "https://slovník.gov.cz/datový/číselníky/pojem/číselník");

    //

    const isLoading = associationLoading || classLoading || associationPointsToIsLoading;

    const collapseIsOpen = useToggle(true);

    const detail = useDialog(DataPsmAssociationToClassDetailDialog, ["parentIri", "iri"], {parentIri: "", iri: ""});
    const detailOpen = useCallback(() => detail.open({iri: dataPsmAssociationEndIri, parentIri: parentDataPsmClassIri}), [dataPsmAssociationEndIri, associationPointsToIri]);

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
            {isCiselnik ? <ListRoundedIcon style={{verticalAlign: "middle"}} /> : <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />}
            {isCiselnik ? " " :
                (collapseIsOpen.isOpen ?
                    <IconButton size={"small"} onClick={collapseIsOpen.close}><ExpandMoreIcon /></IconButton> :
                    <IconButton size={"small"} onClick={collapseIsOpen.open}><ExpandLessIcon /></IconButton>
                )
            }
            <span {...dragHandleProps} onDoubleClick={inlineEdit.open}>
                {hasHumanLabelOnAssociationEnd ?
                    <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmAssociationEndIri}>
                        {(label, description) =>
                            <span title={description} className={isCiselnik ? styles.attribute : styles.association}>{label}</span>
                        }
                    </DataPsmGetLabelAndDescription>
                :
                    <LanguageStringUndefineable from={pimAssociation?.pimHumanLabel ?? null}>
                        {label =>
                            <LanguageStringUndefineable from={pimAssociation?.pimHumanDescription ?? null}>
                                {description => <>
                                    {isBackwardsAssociation && <strong>{t("backwards association")}{" "}</strong>}
                                    <span title={description} className={isCiselnik ? styles.attribute : styles.association}>{label}</span>
                                </>}
                            </LanguageStringUndefineable>
                        }
                    </LanguageStringUndefineable>
                }
                {dataPsmClassIri && <>
                    {': '}
                    {isClassReference && `[${t("refers to")}] `}
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
                {dataPsmClassIri && !isCiselnik && <DataPsmClassAddSurroundingsButton dataPsmClassIri={dataPsmClassIri} />}
                {dataPsmAssociationEnd && <>
                    <ActionButton onClick={detailOpen} icon={<EditIcon/>} label={t("button edit")} />
                    <ActionButton onClick={del} icon={<DeleteIcon/>} label={t("button delete")} />
                    <ReplaceAssociationEndWithReference dataPsmAssociationEnd={dataPsmAssociationEnd.iri as string} />
                </>}
            </>}
        </Typography>
        {dataPsmClassIri ?
            <DataPsmClassParts dataPsmClassIri={dataPsmClassIri} isOpen={collapseIsOpen.isOpen}/>
            :
            <>Loading parts</>
        }
        <detail.component />
    </li>;
});
