import React, {memo} from "react";
import KnownDatatypes from "../../../utils/known-datatypes.json";

export const Datatype: React.FC<{iri: string} & React.HTMLAttributes<HTMLSpanElement>> = memo(({iri, ...params}) => {
    const knowDatatype = KnownDatatypes.find(datatype => datatype.iri === iri);
    if (knowDatatype) {
        return <span title={knowDatatype.iri} {...params}>{knowDatatype.prefix}:<strong>{knowDatatype.localPart}</strong></span>;
    } else {
        return <span {...params}>{iri}</span>;
    }
});
