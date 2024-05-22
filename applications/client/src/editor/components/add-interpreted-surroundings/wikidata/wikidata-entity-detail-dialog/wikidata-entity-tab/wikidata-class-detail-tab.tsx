import { WdClassDescOnly, WdClassWithSurroundingsDesc, WdEntityDescOnly } from "@dataspecer/wikidata-experimental-adapter"
import { useWdGetClass } from "../../hooks/wd-get-class";
import { WikidataLoading } from "../../helpers/wikidata-loading";
import { useTranslation } from "react-i18next";
import { WikidataLoadingError } from "../../helpers/wikidata-loading-error";
import { FieldEntitiesContextTriples, WikidataEntityDetailGrid } from "./wikidata-entity-detail-grid";

export interface WikidataClassDetailTabProps {
    wdClass: WdClassDescOnly;
    onNewDetailEntity: (wdEntity: WdEntityDescOnly) => void;
}

function createClassTriples(wdClassWithSurroundings: WdClassWithSurroundingsDesc): FieldEntitiesContextTriples[] {
    const cls = wdClassWithSurroundings.class;
    return [
        { field: "subclass of", values: cls.subclassOf, context: wdClassWithSurroundings.surroundingClassesDescMap},
        { field: "subject of property", values: cls.subjectOfProperty, context: wdClassWithSurroundings.surroundingPropertiesDescMap},
        { field: "value of property", values: cls.valueOfProperty, context: wdClassWithSurroundings.surroundingPropertiesDescMap},
        { field: "external identifier", values: cls.equivalentExternalOntologyClasses }
    ]
}

export const WikidataClassDetailTab: React.FC<WikidataClassDetailTabProps> = ({wdClass, onNewDetailEntity}) => {
    const { t } = useTranslation("detail")
    const { wdClassWithSurroundings, isLoading, isError } = useWdGetClass(wdClass);

    return (
        <>
            {isLoading && <WikidataLoading />}
            {isError && <WikidataLoadingError errorMessage={t("wikidata.error")} />}
            {!isLoading && !isError &&
                <WikidataEntityDetailGrid 
                    triples={createClassTriples(wdClassWithSurroundings)} 
                    onNewDetailEntity={onNewDetailEntity} 
                />  
            } 
        </>
    )
}