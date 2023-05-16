"use client";
import React, { useState } from "react";
import type { Attribute, CimClass } from "../model/cim-defs";
import { getRandomName } from "../utils/random-gen";

const NewAttributeInputRow: React.FC<{
    cls: CimClass;
    addAttributeToClassHandler: (attr: Attribute) => void;
}> = ({ cls, addAttributeToClassHandler }) => {
    const [attribValue, setAttribValue] = useState(getRandomName());

    return (
        <div className="inline-block" key={cls.id}>
            <input
                className="w-[70%] border-2 border-neutral-400"
                value={attribValue}
                onChange={(e) => setAttribValue(e.target.value)}
            />
            <button
                className="mx-2 rounded-md bg-indigo-600 px-1 text-white hover:bg-slate-200 hover:text-indigo-600"
                onClick={() => {
                    console.log(attribValue);
                    addAttributeToClassHandler({ name: attribValue, value: "1" });
                    setAttribValue(getRandomName(4));
                }}
                type="button"
            >
                <strong>Add</strong>
            </button>
        </div>
    );
};

export default NewAttributeInputRow;
