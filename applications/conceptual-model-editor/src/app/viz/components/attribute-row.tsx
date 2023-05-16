import React from "react";
import type { Attribute } from "../model/cim-defs";

const AttributeRow = ({ attr, handleDelete }: { attr: Attribute; handleDelete: () => void }) => {
    return (
        <div className="flex flex-row " key={attr.name + attr.value}>
            <button type="button" className="px-1 hover:bg-slate-100" onClick={handleDelete}>
                🗑️
            </button>
            <h4 className="mr-2">{attr.name}</h4>
            <p className="mr-2">[type]</p>
        </div>
    );
};

export default AttributeRow;
