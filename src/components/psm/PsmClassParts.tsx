import React from "react";
import {Draggable, Droppable} from "react-beautiful-dnd";
import {PsmAttributeItem} from "./PsmAttributeItem";
import {Collapse} from "@material-ui/core";
import {StoreContext} from "../App";
import {PsmAssociation, PsmAttribute, PsmClass} from "model-driven-data";
import {PsmAssociationClassItem} from "./PsmAssociationClassItem";

/**
 * Renders parts (class attributes and class associations) for specified class.
 */
export const PsmClassParts: React.FC<{forClass: string, isOpen: boolean}> = ({forClass, isOpen}) => {
    const {store} = React.useContext(StoreContext);

    const cls = store[forClass] as PsmClass;

    return <Collapse in={isOpen} unmountOnExit>
        <Droppable droppableId={forClass} type={forClass}>
            {provided =>
                <ul ref={provided.innerRef} {...provided.droppableProps}>
                    {cls.psmParts?.map((part, index) => <Draggable index={index} key={part} draggableId={part}>
                        {provided =>
                            <div ref={provided.innerRef} {...provided.draggableProps}>
                                {PsmAttribute.is(store[part]) && <PsmAttributeItem id={part} dragHandleProps={provided.dragHandleProps} parent={cls} index={index}/>}
                                {PsmAssociation.is(store[part]) && <PsmAssociationClassItem id={part} dragHandleProps={provided.dragHandleProps} parent={cls} index={index} />}
                                {/*PsmIncludes.is(store[part]) && null*/}
                            </div>
                        }
                    </Draggable>)}
                    {provided.placeholder}
                </ul>
            }
        </Droppable>
    </Collapse>;
};
