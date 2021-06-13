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

const termStyle: React.CSSProperties = {
    fontFamily: "monospace",
    fontWeight: "bold",
    color: "red",
};

const useStyles = makeStyles(() =>
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
        }
    }),
);

/**
 * This component represents either PSM class or PSM association to a PSM class.
 * @param id
 * @constructor
 */
export const PsmAssociationClassItem: React.FC<{id: string}> = ({id}) => {
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
            {association &&
                <>
                    {association.psmTechnicalLabel ?
                        <><span style={termStyle}>{association.psmTechnicalLabel}</span> association </> : <>unlabeled
                            association </>}
                    <PsmInterpretedAgainst store={store} entity={association}/>
                    {' to '}
                </>
            }
            {cls.psmTechnicalLabel ?
                <><span style={termStyle}>{cls.psmTechnicalLabel || "[no label]"}</span> class</> : <>unlabeled class</>}
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
            <ul>
                {cls.psmParts?.map(part => {
                    if (PsmAttribute.is(store[part])) return <PsmAttributeItem id={part} key={part} />;
                    if (PsmAssociation.is(store[part])) return <PsmAssociationClassItem id={part} key={part} />;
                    return null;
                })}
            </ul>
        </Collapse>

        <AddInterpretedSurroundingDialog store={store} isOpen={surroundingDialog.isOpen} close={surroundingDialog.close} selected={psmSelectedInterpretedSurroundings} psmClass={cls} />
        {association && <AssociationDetailDialog store={store} association={association} isOpen={editDialog.isOpen} close={editDialog.close} updateTechnicalLabel={psmModifyTechnicalLabel} />}
    </li>;
}
