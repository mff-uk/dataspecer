import React from "react";
import { CimDispatch, CimState2 } from "../cim-change-reducer";

const UglyAvailableCimClasses: React.FC<{ cimState: CimState2; cimDispatch: CimDispatch }> = ({
    cimState,
    cimDispatch,
}) => {
    const classesInView = [...cimState.viewLayout.elementPositionMapWithClassRef.keys()];

    return (
        <div className="w-/6 absolute inset-y-0 left-0 bg-white p-2">
            <div>
                <h1 className="mb-2 text-xl">Available Classes</h1>
                <ul>
                    {classesInView.map((c) => (
                        <li key={c.id}>{c.name}</li>
                    ))}
                </ul>
                <h2 className="text-l mb-2">Classes in view</h2>
                <ul>
                    {cimState.cims
                        .map((c) => c.classes)
                        .flat()
                        .filter((cls) => !classesInView.includes(cls))
                        .map((c) => (
                            <li key={c.id}>{c.name}</li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default UglyAvailableCimClasses;
