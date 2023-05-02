import React from "react";

import { CimDispatch, CimActionKind, CimState2 } from "../cim-change-reducer";
import AttributeRow from "./attribute-row";
import NewAttributeInputRow from "./new-attribute-input-row";

// export const Sidebar: React.FC<{ cimState: CimState; cimDispatch: CimDispatch }> = ({ cimState, cimDispatch }) => {
export const Sidebar: React.FC<{ cimState: CimState2; cimDispatch: CimDispatch }> = ({ cimState, cimDispatch }) => {
    const classToShow = cimState.highlightedElement;

    return (
        <div className="absolute inset-y-0 right-0 w-2/6 bg-white p-2">
            {classToShow && (
                <div>
                    <h1 className="mb-2 text-xl">
                        <strong>{classToShow.name}</strong>
                    </h1>
                    <div className="flex flex-col">
                        {classToShow.attributes.map((a) => (
                            <AttributeRow
                                attr={a}
                                handleDelete={() => {
                                    cimDispatch({
                                        type: CimActionKind.REMOVE_ATTRIBUTE,
                                        clsId: classToShow.id,
                                        payload: {
                                            name: a.name,
                                        },
                                    });
                                }}
                            />
                        ))}
                    </div>
                    <NewAttributeInputRow />
                </div>
            )}
        </div>
    );
};
