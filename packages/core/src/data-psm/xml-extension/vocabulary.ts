import {PSM_EXTENSIONS} from "../data-psm-vocabulary";

export const XML_EXTENSION = PSM_EXTENSIONS + "xml" as `${typeof PSM_EXTENSIONS}xml`; // as const

//

const base = XML_EXTENSION + "/";

export const SET_NAMESPACE = base + "setNamespace";
