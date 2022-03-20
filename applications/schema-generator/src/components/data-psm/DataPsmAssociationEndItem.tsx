import React, {memo, useCallback, useContext, useMemo} from "react";
import {useToggle} from "../../hooks/useToggle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {DataPsmClassPartItemProperties, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {DataPsmClassParts} from "./DataPsmClassParts";
import {IconButton, MenuItem} from "@mui/material";
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmAssociationEnd, DataPsmClass, DataPsmClassReference} from "@model-driven-data/core/data-psm/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/use-data-psm-and-interpreted-pim";
import {PimAssociationEnd, PimClass} from "@model-driven-data/core/pim/model";
import {DataPsmAssociationToClassDetailDialog} from "../detail/data-psm-association-to-class-detail-dialog";
import {InlineEdit} from "./common/InlineEdit";
import {LanguageString} from "@model-driven-data/core/core";
import {LanguageStringUndefineable} from "../helper/LanguageStringComponents";
import {DeleteAssociationClass} from "../../operations/delete-association-class";
import {usePimAssociationFromPimAssociationEnd} from "./use-pim-association-from-pim-association-end";
import {useResource} from "@model-driven-data/federated-observable-store-react/use-resource";
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import {ItemRow} from "./item-row";
import {DataPsmClassAddSurroundingsButton} from "./class/DataPsmClassAddSurroundingsButton";
import {ReplaceAssociationEndWithReference} from "./replace-association-with-reference/replace-association-end-with-reference";
import {AddInterpretedSurroundingsDialog} from "../add-interpreted-surroundings";
import {useDialog} from "../../dialog";
import {Icons} from "../../icons";
import {ReplaceAssociationWithReferenceDialog} from "./replace-association-with-reference/replace-association-with-reference-dialog";
import {getCardinalityFromResource} from "./common/cardinality";
import {ReplaceAlongInheritanceDialog} from "./replace-along-inheritance/replace-along-inheritance-dialog";
import {ActionsOther} from "./common/actions-other";
import {useFederatedObservableStore} from "@model-driven-data/federated-observable-store-react/store";

/**
 * This component handles rendering of data PSM association end item in the tree representation.
 *
 * Because the association end itself is not that interesting, this component also renders the class
 * or class reference the association end points to. Class reference is a reference to another class
 * and again, the class reference itself is not so interesting, therefore the class is shown.
 */
export const DataPsmAssociationEndItem: React.FC<DataPsmClassPartItemProperties> = memo(({dataPsmResourceIri: dataPsmAssociationEndIri, parentDataPsmClassIri, dragHandleProps}) => {
    const {t} = useTranslation("psm");
    const styles = useItemStyles();
    const store = useFederatedObservableStore();

    // Data PSM association end

    const {dataPsmResource: dataPsmAssociationEnd, pimResource: pimAssociationEnd} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(dataPsmAssociationEndIri);
    const readOnly = false;

    // PIM Association and check if it is backward association

    const {resource: pimAssociation} = usePimAssociationFromPimAssociationEnd(pimAssociationEnd?.iri ?? null);
    const isBackwardsAssociation = useMemo(() => pimAssociation && pimAssociation.pimEnd[0] === pimAssociationEnd?.iri, [pimAssociation, pimAssociationEnd]);

    // range class or range class reference with class

    const associationPointsToIri = dataPsmAssociationEnd?.dataPsmPart ?? null;
    const {resource: associationPointsTo} = useResource(associationPointsToIri);
    const isClassReference = associationPointsTo && DataPsmClassReference.is(associationPointsTo); // Whether the association points to a class reference or just a normal class

    const dataPsmClassIri = isClassReference ? associationPointsTo.dataPsmClass : associationPointsToIri;
    const {dataPsmResource: dataPsmClass, pimResource: pimClass} = useDataPsmAndInterpretedPim<DataPsmClass, PimClass>(dataPsmClassIri);
    const dataPsmClassIsReadOnly = false;

    const isCodelist = pimClass?.pimIsCodelist ?? false;

    //

    const collapseIsOpen = useToggle(!isClassReference); /** Uses {@link useStateWithMutableInitial} */

    // Dialogs

    const detail = useDialog(DataPsmAssociationToClassDetailDialog);
    const detailOpen = useCallback(() => detail.open({iri: dataPsmAssociationEndIri, parentIri: parentDataPsmClassIri}), [dataPsmAssociationEndIri, detail, parentDataPsmClassIri]);
    const AddSurroundings = useDialog(AddInterpretedSurroundingsDialog, ["dataPsmClassIri"]);
    const ReplaceDialog = useDialog(ReplaceAssociationWithReferenceDialog);
    const ReplaceAlongHierarchy = useDialog(ReplaceAlongInheritanceDialog);

    const del = useCallback(() => dataPsmAssociationEnd && dataPsmClass &&
            store.executeComplexOperation(new DeleteAssociationClass(dataPsmAssociationEnd, dataPsmClass, parentDataPsmClassIri)),
        [dataPsmAssociationEnd, dataPsmClass, parentDataPsmClassIri, store]);

    const inlineEdit = useToggle();

    // We need to decide whether there is a human label on Data PSM association end or PIM association end.
    // If no, we show a label of PIM association with extra information about the direction.

    const associationEndHumanLabel: LanguageString = useMemo(() => ({...pimAssociationEnd?.pimHumanLabel, ...dataPsmAssociationEnd?.dataPsmHumanLabel}), [pimAssociationEnd?.pimHumanLabel, dataPsmAssociationEnd?.dataPsmHumanLabel]);
    const hasHumanLabelOnAssociationEnd = Object.keys(associationEndHumanLabel).length > 0;

    return <li className={styles.li}>
        <ItemRow actions={<>
            {dataPsmClassIri && !isCodelist && !dataPsmClassIsReadOnly && <DataPsmClassAddSurroundingsButton open={AddSurroundings.open} />}
            {dataPsmAssociationEnd && <>
                {readOnly ?
                    <MenuItem onClick={detailOpen} title={t("button edit")}><Icons.Tree.Info/></MenuItem> :
                    <MenuItem onClick={detailOpen} title={t("button info")}><Icons.Tree.Edit/></MenuItem>
                }

                {readOnly || <>
                    <MenuItem onClick={del} title={t("button delete")}><Icons.Tree.Delete/></MenuItem>
                    <ReplaceAssociationEndWithReference dataPsmAssociationEnd={dataPsmAssociationEnd.iri as string} open={ReplaceDialog.open} />
                </>}

                <ActionsOther>
                    {close => <>
                        <MenuItem
                            onClick={() => {
                              close();
                              dataPsmClass?.iri && ReplaceAlongHierarchy.open({dataPsmClassIri: dataPsmClass.iri});
                            }}
                            title={t("button replace along inheritance")}>
                            {t("button replace along inheritance")}
                        </MenuItem>
                    </>}
                </ActionsOther>

            </>}
        </>} readOnly={readOnly}>

            {/* active when not  inlineEdit.isOpen */}
            {isCodelist ? <ListRoundedIcon style={{verticalAlign: "middle"}} /> : <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />}
            {isCodelist ? " " :
                (collapseIsOpen.isOpen ?
                        <IconButton size={"small"} onClick={collapseIsOpen.close}><ExpandMoreIcon /></IconButton> :
                        <IconButton size={"small"} onClick={collapseIsOpen.open}><ExpandLessIcon /></IconButton>
                )
            }
            <span {...dragHandleProps} onDoubleClick={readOnly ? () => null : inlineEdit.open}>
                        {hasHumanLabelOnAssociationEnd ?
                            <DataPsmGetLabelAndDescription dataPsmResourceIri={dataPsmAssociationEndIri}>
                                {(label, description) =>
                                    <span title={description} className={isCodelist ? styles.attribute : styles.association}>{label}</span>
                                }
                            </DataPsmGetLabelAndDescription>
                            :
                            <LanguageStringUndefineable from={pimAssociation?.pimHumanLabel ?? null}>
                                {label =>
                                    <LanguageStringUndefineable from={pimAssociation?.pimHumanDescription ?? null}>
                                        {description => <>
                                            {isBackwardsAssociation && <strong>{t("backwards association")}{" "}</strong>}
                                            <span title={description} className={isCodelist ? styles.attribute : styles.association}>{label}</span>
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

                        {pimAssociationEnd && (" " + getCardinalityFromResource(pimAssociationEnd))}
                    </>}
                    </span>
        </ItemRow>

        {dataPsmClassIri && <DataPsmClassParts dataPsmClassIri={dataPsmClassIri} isOpen={collapseIsOpen.isOpen}/>}

        <detail.Component />
        {dataPsmClassIri && <AddSurroundings.Component dataPsmClassIri={dataPsmClassIri} />}
        <ReplaceDialog.Component />
        <ReplaceAlongHierarchy.Component />
    </li>;
});
