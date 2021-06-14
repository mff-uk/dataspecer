import React, {useCallback} from "react";
import {PsmAttribute} from "model-driven-data";
import {Chip} from "@material-ui/core";
import {AttributeDetailDialog} from "../psmDetail/AttributeDetailDialog";
import {StoreContext} from "../App";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {PsmInterpretedAgainst} from "./PsmInterpretedAgainst";
import {useToggle} from "../../hooks/useToggle";

const useStyles = makeStyles((theme: Theme) =>
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
        term: {
            fontFamily: "monospace",
            fontWeight: "bold",
            color: theme.palette.primary.main,
        }
    }),
);

/**
 * Component rendering PSM attribute into a PSM tree
 * @param id string id of the attribute, because the attribute may not exists under the given store.
 */
export const PsmAttributeItem: React.FC<{id: string}> = ({id}) => {
    const dialog = useToggle();

    const {store, psmModifyTechnicalLabel, psmDeleteAttribute} = React.useContext(StoreContext);

    const attribute = store[id] as PsmAttribute;

    const del = useCallback(() => psmDeleteAttribute(attribute), [psmDeleteAttribute, attribute]);

    const styles = useStyles();

    return <>
        <li>
            <div className={styles.root}>
                {attribute.psmTechnicalLabel ?
                    <span className={styles.term}>{attribute.psmTechnicalLabel}</span> : <>unlabeled attribute</>}
                {' '}
                <PsmInterpretedAgainst store={store} entity={attribute}/>
                {' '}
                <Chip className={styles.chip} variant="outlined" size="small" onClick={dialog.open} icon={<EditIcon/>} label={"edit"}/>
                {' '}
                <Chip className={styles.chip} variant="outlined" color={"secondary"} size="small" onClick={del} icon={<DeleteIcon/>} label={"delete"}/>
            </div>
        </li>

        <AttributeDetailDialog store={store} attribute={attribute} isOpen={dialog.isOpen} close={dialog.close} updateTechnicalLabel={psmModifyTechnicalLabel} />
    </>;
}
