import {DraggableProvidedDragHandleProps} from "react-beautiful-dnd";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {PsmClass} from "model-driven-data";

export interface PsmItemCommonAttributes {
    id: string;
    dragHandleProps?: DraggableProvidedDragHandleProps;
    parent?: PsmClass;
    index?: number;
}

export const useItemStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            "&>$actionButton": {
                opacity: 0
            },
            "&:hover>$actionButton, &:focus-within>$actionButton": {
                opacity: 1
            }
        },
        actionButton: {
            transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
            margin: "0 .25rem"
        },
        technicalLabel: {
            fontFamily: "monospace",
            wordBreak: "break-all",
        },
        type: {
            fontFamily: "monospace",
            wordBreak: "break-all",
        },
        attribute: {
            fontWeight: "bold",
            color: theme.palette.primary.main,
        },
        association: {
            fontWeight: "bold",
            color: theme.palette.secondary.main,
        },
        class: {
            fontWeight: "bold",
        },
        li: {
            listStyleType: "none",
        },
        icon: {
            verticalAlign: "middle",
            margin: "0 .25rem",
            fontSize: "1rem"
        }
    }),
);
