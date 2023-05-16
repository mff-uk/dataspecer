import React from "react";

import AttributeRow from "./components/attribute-row";
import NewAttributeInputRow from "./components/new-attribute-input-row";
import { type Attribute } from "./model/cim-defs";
import { useCimContext } from "./utils/hooks/use-cim-context";

const Sidebar2: React.FC = () => {
    const { cimContext, addAttribute, removeAttribute } = useCimContext();
    const classToShow = cimContext.highlightedElement;

    const addAttributeToClassHandler = (attr: Attribute) => {
        if (classToShow) addAttribute(classToShow, attr);
    };

    const handleDelete = (attr: Attribute) => {
        if (classToShow) removeAttribute(classToShow, attr);
    };

    return (
        <div className="overflow-hidden bg-white p-2">
            {classToShow && (
                <div>
                    <h1 className="mb-2 text-xl">
                        <strong>{classToShow.name}</strong>
                    </h1>
                    <NewAttributeInputRow cls={classToShow} addAttributeToClassHandler={addAttributeToClassHandler} />
                    <div className="flex flex-col">
                        {classToShow.attributes.map((a) => (
                            <AttributeRow attr={a} handleDelete={() => handleDelete(a)} key={classToShow.id + a.name} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar2;
