import React from "react";
import { Attribute } from "../model/cim-defs";

const AttributeRow = ({ attr, handleDelete }: { attr: Attribute; handleDelete: () => any }) => {
    return (
        <div className="flex flex-row " key={attr.name + attr.value}>
            <h4 className="mr-2">{attr.name}</h4>
            <p className="mr-2">[type]</p>
            <button type="button" className="px-1 hover:bg-slate-100" onClick={handleDelete}>
                🗑️
            </button>
        </div>
    );
};

export default AttributeRow;
