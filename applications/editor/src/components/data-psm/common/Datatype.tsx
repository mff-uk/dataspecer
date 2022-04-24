import React, {memo} from "react";
import {knownDatatypes} from "../../../utils/known-datatypes";
import {selectLanguage} from "../../../utils/select-language";
import {useTranslation} from "react-i18next";

export const Datatype: React.FC<{iri: string} & React.HTMLAttributes<HTMLSpanElement>> = memo(({iri, ...params}) => {
    const {i18n} = useTranslation();
    const knowDatatype = knownDatatypes.find(datatype => datatype.iri === iri);
    if (knowDatatype) {
        return <span title={knowDatatype.iri} {...params}>
            {knowDatatype.prefix !== undefined && knowDatatype.localPart !== undefined ?
                <>{knowDatatype.prefix}:<strong>{knowDatatype.localPart}</strong></>
                : selectLanguage(knowDatatype.label ?? {}, i18n.languages)
            }
        </span>;
    } else {
        return <span {...params}>{iri}</span>;
    }
});
