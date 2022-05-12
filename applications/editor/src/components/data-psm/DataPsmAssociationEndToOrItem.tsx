import React, {memo, useCallback, useMemo} from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {DataPsmClassPartItemProperties, useItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";
import {Collapse, IconButton, MenuItem} from "@mui/material";
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import {DataPsmGetLabelAndDescription} from "./common/DataPsmGetLabelAndDescription";
import {DataPsmAssociationEnd, DataPsmOr} from "@dataspecer/core/data-psm/model";
import {useDataPsmAndInterpretedPim} from "../../hooks/use-data-psm-and-interpreted-pim";
import {PimAssociationEnd} from "@dataspecer/core/pim/model";
import {CoreResourceReader, LanguageString} from "@dataspecer/core/core";
import {LanguageStringUndefineable} from "../helper/LanguageStringComponents";
import {usePimAssociationFromPimAssociationEnd} from "./use-pim-association-from-pim-association-end";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {ItemRow} from "./item-row";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {TransitionGroup} from "react-transition-group";
import {DataPsmClassItem} from "./DataPsmClassItem";
import {ActionsOther} from "./common/actions-other";
import {UnwrapOr} from "../../operations/unwrap-or";
import {Icons} from "../../icons";
import AddIcon from "@mui/icons-material/Add";
import {useDialog} from "../../dialog";
import {AddToOrDialog} from "./add-to-or/add-to-or-dialog";
import {CreateNewClassInOr} from "../../operations/create-new-class-in-or";
import {useToggle} from "../../hooks/use-toggle";


/**
 * This component handles rendering of data PSM association end item in the tree representation.
 *
 * Because the association end itself is not that interesting, this component also renders the class
 * or class reference the association end points to. Class reference is a reference to another class
 * and again, the class reference itself is not so interesting, therefore the class is shown.
 */
export const DataPsmAssociationEndToOrItem: React.FC<DataPsmClassPartItemProperties> = memo(({dataPsmResourceIri: dataPsmAssociationEndIri, dragHandleProps}) => {
    const {t} = useTranslation("psm");
    const styles = useItemStyles();
    const store = useFederatedObservableStore();

    const AddToOr = useDialog(AddToOrDialog, ["typePimClassIri", "onSelected"]);

    // Data PSM association end

    const {dataPsmResource: dataPsmAssociationEnd, pimResource: pimAssociationEnd} = useDataPsmAndInterpretedPim<DataPsmAssociationEnd, PimAssociationEnd>(dataPsmAssociationEndIri);

    // PIM Association and check if it is backward association

    const {resource: pimAssociation} = usePimAssociationFromPimAssociationEnd(pimAssociationEnd?.iri ?? null);
    const isBackwardsAssociation = useMemo(() => pimAssociation && pimAssociation.pimEnd[0] === pimAssociationEnd?.iri, [pimAssociation, pimAssociationEnd]);

    // range class or range class reference with class

    const dataPsmOrIri = dataPsmAssociationEnd?.dataPsmPart ?? null;
    const {resource: dataPsmOr} = useResource<DataPsmOr>(dataPsmOrIri);

    const collapseIsOpen = useToggle(true);

    const associationEndHumanLabel: LanguageString = useMemo(() => ({...pimAssociationEnd?.pimHumanLabel, ...dataPsmAssociationEnd?.dataPsmHumanLabel}), [pimAssociationEnd?.pimHumanLabel, dataPsmAssociationEnd?.dataPsmHumanLabel]);
    const hasHumanLabelOnAssociationEnd = Object.keys(associationEndHumanLabel).length > 0;

    const unwrap = useCallback(() =>
            dataPsmOrIri && store.executeComplexOperation(new UnwrapOr(dataPsmOrIri, dataPsmAssociationEndIri))
        , [store, dataPsmOrIri, dataPsmAssociationEndIri]);

    const onAddClass = useCallback(async (pimClassIri: string, pimStore: CoreResourceReader) => {
        if (dataPsmOrIri) {
            await store.executeComplexOperation(new CreateNewClassInOr(dataPsmOrIri, pimClassIri, pimStore));
            AddToOr.close();
        }
    }, [AddToOr, dataPsmOrIri, store]);

    const typePimClassIri = pimAssociationEnd?.pimPart;


    return <li className={styles.li}>
        <ItemRow actions={<>
            <MenuItem onClick={() => AddToOr.open({})} title={t("button add")}><AddIcon/></MenuItem>
            <MenuItem onClick={() => null} title={t("button delete")}><Icons.Tree.Delete/></MenuItem>
            <ActionsOther>
                {close => <>
                    <MenuItem
                        onClick={() => {
                            close();
                            unwrap();
                        }}>
                        {t("Unwrap")}
                    </MenuItem>
                </>}
            </ActionsOther>
        </>}>
            <AccountTreeTwoToneIcon style={{verticalAlign: "middle"}} />
            {collapseIsOpen.isOpen ?
                <IconButton size={"small"} onClick={collapseIsOpen.close}><ExpandMoreIcon/></IconButton> :
                <IconButton size={"small"} onClick={collapseIsOpen.open}><ExpandLessIcon/></IconButton>
            }

            <span {...dragHandleProps}>
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
                {': '}

                <span className={styles.or}>OR</span>
            </span>
        </ItemRow>

        {dataPsmOr &&
            <Collapse in={collapseIsOpen.isOpen} unmountOnExit>
                <ul>
                    <TransitionGroup exit={false}>
                        {dataPsmOr.dataPsmChoices.map(iri => <Collapse key={iri}>
                            <DataPsmClassItem dataPsmClassIri={iri} />
                        </Collapse>)}
                    </TransitionGroup>
                </ul>
            </Collapse>
        }

        {typePimClassIri && <AddToOr.Component typePimClassIri={typePimClassIri} onSelected={onAddClass}/>}
    </li>;
});
