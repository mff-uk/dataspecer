import React, {memo} from "react";
import {Draggable, DraggableProvidedDragHandleProps, Droppable} from "react-beautiful-dnd";
import {DataPsmAttributeItem} from "./DataPsmAttributeItem";
import {Collapse} from "@mui/material";
import {DataPsmAssociationEndItem} from "./DataPsmAssociationEndItem";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass, DataPsmInclude, DataPsmOr} from "@dataspecer/core/data-psm/model";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {TransitionGroup} from "react-transition-group";
import {DataPsmIncludeItem} from "./DataPsmIncludeItem";
import {DataPsmAssociationEndToOrItem} from "./DataPsmAssociationEndToOrItem";

interface DataPsmResourceSwitchProperties {
    dataPsmResourceIri: string,
    dragHandleProps?: DraggableProvidedDragHandleProps;
    parentDataPsmClassIri: string;
    index?: number;
}

/**
 * This component takes an IRI of resource that should be rendered and based of the type it calls the component to
 * render it. During the update, it will remembers the last type to not discard the subtree.
 */
const DataPsmResourceSwitch: React.FC<DataPsmResourceSwitchProperties> = memo((props) => {
    const {resource: dataPsmResource, isLoading} = useResource(props.dataPsmResourceIri);
    let secondResourceIri = null;
    if (DataPsmAssociationEnd.is(dataPsmResource)) {
        secondResourceIri = dataPsmResource.dataPsmPart;
    }
    const {resource: secondResource, isLoading: isSecondLoading} = useResource(secondResourceIri);

    if (!dataPsmResource || (!secondResource && secondResourceIri)) {
        if (isLoading || isSecondLoading) {
            return <div {...props.dragHandleProps}>Loading resource...</div>;
        } else {
            return <div {...props.dragHandleProps}>Unable to read resource {props.dataPsmResourceIri}</div>;
        }
    } else if (DataPsmAttribute.is(dataPsmResource)) {
        return <DataPsmAttributeItem {...props}/>;
    } else if (DataPsmAssociationEnd.is(dataPsmResource)) {
        if (DataPsmOr.is(secondResource)) {
            return <DataPsmAssociationEndToOrItem {...props} />;
        } else {
            return <DataPsmAssociationEndItem {...props} />;
        }
    } else if (DataPsmInclude.is(dataPsmResource)) {
        return <DataPsmIncludeItem {...props} />;
    } else {
        return <div {...props.dragHandleProps}>Unsupported resource</div>;
    }
});

/**
 * Renders parts (class attributes and class associations) for specified class.
 */
export const DataPsmClassParts: React.FC<{dataPsmClassIri: string, isOpen: boolean}> = memo(({dataPsmClassIri, isOpen}) => {
    const {resource: dataPsmClass} = useResource<DataPsmClass>(dataPsmClassIri);
    const readOnly = false;

    return <Collapse in={isOpen} unmountOnExit>
        <Droppable droppableId={dataPsmClassIri} type={dataPsmClassIri} isDropDisabled={readOnly}>
            {provided =>
                <ul ref={provided.innerRef} {...provided.droppableProps}>
                    <TransitionGroup exit={false}>
                        {dataPsmClass?.dataPsmParts?.map((part, index) => <Collapse key={part}><Draggable index={index} draggableId={part}>
                            {provided =>
                                <div ref={provided.innerRef} {...provided.draggableProps}>
                                    <DataPsmResourceSwitch dataPsmResourceIri={part} dragHandleProps={readOnly ? undefined : provided.dragHandleProps} parentDataPsmClassIri={dataPsmClassIri} index={index} />
                                </div>
                            }
                        </Draggable></Collapse>)}
                        {provided.placeholder}
                    </TransitionGroup>
                </ul>
            }
        </Droppable>
    </Collapse>;
});
