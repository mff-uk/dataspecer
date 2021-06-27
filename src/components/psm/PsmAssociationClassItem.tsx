import React from "react";
import {PimClass, PsmAssociation, PsmAttribute, PsmClass} from "model-driven-data";
import {PsmAttributeItem} from "./PsmAttributeItem";
import {StoreContext} from "../App";
import {Chip, Collapse} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import {AddInterpretedSurroundingDialog} from "../addInterpretedSurroundings/addInterpretedSurroundingDialog";
import {AssociationDetailDialog} from "../psmDetail/AssociationDetailDialog";
import {PsmInterpretedAgainst} from "./PsmInterpretedAgainst";
import {useToggle} from "../../hooks/useToggle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import {Draggable, Droppable} from "react-beautiful-dnd";
import {PsmDeleteItem, PsmItemCommonAttributes, usePsmItemStyles} from "./PsmItemCommon";
import {useTranslation} from "react-i18next";

/**
 * This component represents either PSM class or PSM association to a PSM class.
 * @param id
 * @param dragHandleProps
 * @constructor
 */
export const PsmAssociationClassItem: React.FC<PsmItemCommonAttributes> = ({id, dragHandleProps, parent, index}) => {
    const {store, psmSelectedInterpretedSurroundings, psmModifyTechnicalLabel} = React.useContext(StoreContext);
    const {t} = useTranslation("psm");

    // Association is only set if we are dealing with associations
    const association = PsmAssociation.is(store[id]) ? store[id] as PsmAssociation : null;
    const cls = association ? store[association.psmParts[0]] as PsmClass : store[id] as PsmClass;

    const interpretedCim = cls.psmInterpretation && (store[cls.psmInterpretation] as PimClass).pimInterpretation;

    const surroundingDialog = useToggle();
    const editDialog = useToggle();
    const collapse = useToggle(true);

    const styles = usePsmItemStyles();

    return <li>
        <div className={styles.root}>
            {collapse.isOpen ?
                <ExpandMoreIcon className={styles.icon} onClick={collapse.close} /> :
                <ExpandLessIcon className={styles.icon} onClick={collapse.open} />
            }
                {association &&
                    <>
                        <span {...dragHandleProps}>
                            {association.psmTechnicalLabel ?
                                <span className={`${styles.term} ${styles.classAssociation}`}>{association.psmTechnicalLabel}</span> : <span className={styles.classAssociation}>[{t('unlabeled')}]</span>}
                        </span>
                        {' '}
                        <PsmInterpretedAgainst store={store} entity={association}/>
                        {' to '}
                    </>
                }
                {cls.psmTechnicalLabel ?
                    <span className={`${styles.term} ${styles.classAssociation}`}>{cls.psmTechnicalLabel}</span> : <span className={styles.classAssociation}>[{t('unlabeled')}]</span>}
            {' '}
            <PsmInterpretedAgainst store={store} entity={cls}/>
            {' '}
            {interpretedCim && <Chip className={styles.chip} variant="outlined" size="small" onClick={surroundingDialog.open} icon={<AddIcon/>} label={t("button add")}/>}
            {association && <>
                {' '}
                <Chip className={styles.chip} variant="outlined" size="small" onClick={editDialog.open} icon={<EditIcon/>} label={t("button edit")}/>
                {' '}
                {parent && index !== undefined && <PsmDeleteItem parent={parent} index={index} />}
            </>}
        </div>
        <Collapse in={collapse.isOpen} unmountOnExit>
            <Droppable droppableId={cls.id} type={cls.id}>
                {provided =>
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                        {cls.psmParts?.map((part, index) => <Draggable index={index} key={part} draggableId={part}>
                            {provided =>
                                <div ref={provided.innerRef} {...provided.draggableProps}>
                                    {PsmAttribute.is(store[part]) && <PsmAttributeItem id={part} dragHandleProps={provided.dragHandleProps} parent={cls} index={index}/>}
                                    {PsmAssociation.is(store[part]) && <PsmAssociationClassItem id={part} dragHandleProps={provided.dragHandleProps} parent={cls} index={index} />}
                                </div>
                            }
                        </Draggable>)}
                        {provided.placeholder}
                    </ul>
                }
            </Droppable>
        </Collapse>

        <AddInterpretedSurroundingDialog store={store} isOpen={surroundingDialog.isOpen} close={surroundingDialog.close} selected={psmSelectedInterpretedSurroundings} psmClass={cls} />
        {association && <AssociationDetailDialog store={store} association={association} isOpen={editDialog.isOpen} close={editDialog.close} updateTechnicalLabel={psmModifyTechnicalLabel} />}
    </li>;
}
