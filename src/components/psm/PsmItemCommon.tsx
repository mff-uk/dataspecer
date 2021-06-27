import {DraggableProvidedDragHandleProps} from "react-beautiful-dnd";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import {Chip} from "@material-ui/core";
import React, {useCallback} from "react";
import {StoreContext} from "../App";
import {PsmClass} from "model-driven-data";
import {useTranslation} from "react-i18next";

export interface PsmItemCommonAttributes {
    id: string;
    dragHandleProps?: DraggableProvidedDragHandleProps;
    parent?: PsmClass;
    index?: number;
}

export const usePsmItemStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "&>div": {
                opacity: 0
            },
            "&:hover>div, &:focus-within>div": {
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
        },
        attribute: {
            color: theme.palette.primary.main,
        },
        classAssociation: {
            color: theme.palette.secondary.main,
        }
    }),
);


export const PsmDeleteItem: React.FC<{parent: PsmClass, index: number}> = ({parent, index}) => {
    const styles = usePsmItemStyles();
    const {t} = useTranslation("psm");
    const {psmRemoveFromPart} = React.useContext(StoreContext);
    const del = useCallback(() => psmRemoveFromPart(parent, index), [psmRemoveFromPart, parent, index]);

    return <Chip className={styles.chip} variant="outlined" color={"secondary"} size="small" onClick={del} icon={<DeleteIcon/>} label={t("button delete")}/>
}