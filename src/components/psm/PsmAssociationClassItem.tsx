import React from "react";
import {PimClass, PsmAssociation, PsmAttribute, PsmClass} from "model-driven-data";
import {PsmAttributeItem} from "./PsmAttributeItem";
import {StoreContext} from "../App";
import {Chip, Collapse} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import {AddInterpretedSurroundingDialog} from "../addInterpretedSurroundings/addInterpretedSurroundingDialog";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {AssociationDetailDialog} from "../psmDetail/AssociationDetailDialog";
import {PsmInterpretedAgainst} from "./PsmInterpretedAgainst";
import {useToggle} from "../../hooks/useToggle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import {Draggable, Droppable} from "react-beautiful-dnd";
import {PsmItemCommonAttributes} from "./PsmItemCommon";

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            "&>div": {
                opacity: 0
            },
            "&:hover>div": {
                opacity: 1
            }
        },
        chip: {
            transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
        },
        icon: {
            verticalAlign: "middle",
            cursor: "pointer",
        },
        term: {
            fontFamily: "monospace",
            fontWeight: "bold",
            color: theme.palette.secondary.main,
        }
    }),
);

/**
 * This component represents either PSM class or PSM association to a PSM class.
 * @param id
 * @param dragHandleProps
 * @constructor
 */
export const PsmAssociationClassItem: React.FC<PsmItemCommonAttributes> = ({id, dragHandleProps}) => {
    const {store, psmSelectedInterpretedSurroundings, psmModifyTechnicalLabel} = React.useContext(StoreContext);

    // Association is only set if we are dealing with associations
    const association = PsmAssociation.is(store[id]) ? store[id] as PsmAssociation : null;
    const cls = association ? store[association.psmParts[0]] as PsmClass : store[id] as PsmClass;

    const interpretedCim = cls.psmInterpretation && (store[cls.psmInterpretation] as PimClass).pimInterpretation;

    const surroundingDialog = useToggle();
    const editDialog = useToggle();
    const collapse = useToggle(true);

    const styles = useStyles();

    return <li>
        <div className={styles.root}>
            {collapse.isOpen ?
                <ExpandMoreIcon className={styles.icon} onClick={collapse.close} /> :
                <ExpandLessIcon className={styles.icon} onClick={collapse.open} />
            }
            <span {...dragHandleProps}>
                {association &&
                    <>
                        {association.psmTechnicalLabel ?
                            <><span className={styles.term}>{association.psmTechnicalLabel}</span> association </> : <>unlabeled
                                association </>}
                        <PsmInterpretedAgainst store={store} entity={association}/>
                        {' to '}
                    </>
                }
                {cls.psmTechnicalLabel ?
                    <><span className={styles.term}>{cls.psmTechnicalLabel || "[no label]"}</span> class</> : <>unlabeled class</>}
            </span>
            {' '}
            <PsmInterpretedAgainst store={store} entity={cls}/>
            {' '}
            {interpretedCim && <Chip className={styles.chip} variant="outlined" size="small" onClick={surroundingDialog.open} icon={<AddIcon/>} label={"add"}/>}
            {association && <>
                {' '}
                <Chip className={styles.chip} variant="outlined" size="small" onClick={editDialog.open} icon={<EditIcon/>} label={"edit"}/>
            </>}
        </div>
        <Collapse in={collapse.isOpen} unmountOnExit>
            <Droppable droppableId={cls.id} type={cls.id}>
                {provided =>
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                        {cls.psmParts?.map((part, index) => <Draggable index={index} key={part} draggableId={part}>
                            {provided =>
                                <div ref={provided.innerRef} {...provided.draggableProps}>
                                    {PsmAttribute.is(store[part]) && <PsmAttributeItem id={part} dragHandleProps={provided.dragHandleProps}/>}
                                    {PsmAssociation.is(store[part]) && <PsmAssociationClassItem id={part} dragHandleProps={provided.dragHandleProps} />}
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
