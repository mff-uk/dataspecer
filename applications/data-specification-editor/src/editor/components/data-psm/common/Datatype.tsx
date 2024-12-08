import React, {memo} from "react";
import {knownDatatypes} from "../../../utils/known-datatypes";
import {selectLanguage} from "../../../utils/select-language";
import {useTranslation} from "react-i18next";
import {Span} from "../styles";
import {SxProps} from "@mui/material";

export const Datatype: React.FC<{iri: string, style?: object, sx?: SxProps}> = memo(({iri, ...params}) => {
    const {i18n} = useTranslation();
    const knowDatatype = knownDatatypes.find(datatype => datatype.iri === iri);
    if (knowDatatype) {
        return <Span title={knowDatatype.iri} {...params}>
            {knowDatatype.prefix !== undefined && knowDatatype.localPart !== undefined ?
                <>{knowDatatype.prefix}:<strong>{knowDatatype.localPart}</strong></>
                : selectLanguage(knowDatatype.label ?? {}, i18n.languages)
            }
        </Span>;
    } else {
        return <Span {...params}>{iri}</Span>;
    }
});
