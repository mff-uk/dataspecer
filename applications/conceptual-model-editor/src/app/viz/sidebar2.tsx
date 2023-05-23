import React from "react";

import AttributeRow from "./components/attribute-row";
import NewAttributeInputRow from "./components/new-attribute-input-row";
import { useViewLayoutContext2 } from "./utils/hooks/use-view-layout-context2";

const Sidebar2: React.FC = () => {
    const { viewLayout, highlightElement } = useViewLayoutContext2();
    const classToShow = viewLayout.highlitedElement;

    return (
        <div className="bg-white p-2">
            {classToShow && (
                <div>
                    <h1 className="mb-2 text-xl">
                        <strong>{classToShow.name}</strong>
                    </h1>
                    <NewAttributeInputRow
                        cls={classToShow}
                        addAttributeToClassHandler={(attr) => {
                            classToShow.addAttribute(attr);
                            highlightElement(classToShow);
                        }}
                    />
                    <div className="flex flex-col">
                        {classToShow.attributes.map((a) => (
                            <AttributeRow
                                attr={a}
                                handleDelete={() => {
                                    classToShow.removeAttribute(a.name);
                                    highlightElement(classToShow);
                                }}
                                key={classToShow.id + a.name}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar2;
