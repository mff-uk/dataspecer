import { WdClassDescOnly, WdClassWithSurroundingsDesc, WdEntityDescOnly } from "@dataspecer/wikidata-experimental-adapter"
import { useTranslation } from "react-i18next";
import { WikidataLoading } from "../../../add-interpreted-surroundings/wikidata/helpers/wikidata-loading";
import { WikidataLoadingError } from "../../../add-interpreted-surroundings/wikidata/helpers/wikidata-loading-error";
import { useWdGetClass } from "../../../add-interpreted-surroundings/wikidata/hooks/wd-get-class";
import { FieldEntitiesContextTriples, WikidataEntityDetailGrid } from "./wikidata-entity-detail-grid";

export interface WikidataClassDetailTabProps {
    wdClass: WdClassDescOnly;
    onNewDetailEntity: (wdEntity: WdEntityDescOnly) => void;
}

function createClassTriples(wdClassWithSurroundings: WdClassWithSurroundingsDesc): FieldEntitiesContextTriples[] {
    return [
        { field: "subclass of", values: wdClassWithSurroundings.parentsIds, context: wdClassWithSurroundings.surroundingClassesDescMap},
        { field: "subject of property", values: wdClassWithSurroundings.subjectOfIds, context: wdClassWithSurroundings.surroundingPropertiesDescMap},
        { field: "value of property", values: wdClassWithSurroundings.valueOfIds, context: wdClassWithSurroundings.surroundingPropertiesDescMap},
        { field: "external identifier", values: wdClassWithSurroundings.startClass.equivalentExternalOntologyClasses }
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