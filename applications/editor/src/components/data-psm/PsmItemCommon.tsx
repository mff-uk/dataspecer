import {DraggableProvidedDragHandleProps} from "react-beautiful-dnd";
import {createStyles, makeStyles} from "@mui/styles";
import {Theme} from "@mui/material";

/**
 * Component properties for both AssociationEnds and Attributes.
 */
export interface DataPsmClassPartItemProperties {
    /**
     * Resource to render.
     */
    dataPsmResourceIri: string;

    /**
     * Owning class
     */
    parentDataPsmClassIri: string;

    dragHandleProps?: DraggableProvidedDragHandleProps;
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
        include: {
            fontWeight: "bold",
            color: "#b57e3f",
        },
        or: {
            fontWeight: "bold",
            color: "#4caf50",
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
        },
        loading: {},

        attributeInlineEditForm: {
          border: "1px solid " + theme.palette.primary.main,
          background: "#FFFFBB",
          margin: "0 .25rem",
          padding: "0 .25rem"
        },

        associationInlineEditForm: {
          border: "1px solid " + theme.palette.secondary.main,
          background: "#FFFFBB",
          margin: "0 .25rem",
          padding: "0 .25rem"
        },

        /**
         * For items that are read only in modifiable tree.
         */
        readOnly: {
            opacity: .5,
        }
    }),
);
