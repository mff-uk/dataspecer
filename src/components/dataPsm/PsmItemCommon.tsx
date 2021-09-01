import {DraggableProvidedDragHandleProps} from "react-beautiful-dnd";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

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
        loading: {}
    }),
);
