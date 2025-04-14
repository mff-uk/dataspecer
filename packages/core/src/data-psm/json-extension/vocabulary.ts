import {PSM_EXTENSIONS} from "../data-psm-vocabulary.ts";

export const JSON_EXTENSION = PSM_EXTENSIONS + "json" as `${typeof PSM_EXTENSIONS}json`; // as const

//

const base = JSON_EXTENSION + "/";

export const SET_USE_KEY_VALUE_FOR_LANG_STRING = base + "setUseKeyValueForLangString";
