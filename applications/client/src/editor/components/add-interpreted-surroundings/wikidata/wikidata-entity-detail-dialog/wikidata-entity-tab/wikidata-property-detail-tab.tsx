import { WikidataLoading } from "../../helpers/wikidata-loading";
import { useTranslation } from "react-i18next";
import { WikidataLoadingError } from "../../helpers/wikidata-loading-error";
import { FieldEntitiesContextTriples, WikidataEntityDetailGrid } from "./wikidata-entity-detail-grid";
import { WdPropertyDescOnly, WdEntityDescOnly, WdPropertyWithSurroundingDesc } from "@dataspecer/wikidata-experimental-adapter";
import { useWdGetProperty } from "../../hooks/wd-get-property";

export interface WikidataPropertyDetailTabProps {
    wdProperty: WdPropertyDescOnly;
    onNewDetailEntity: (wdEntity: WdEntityDescOnly) => void;
}

function createPropertyTriples(wdPropertyWithSurroundings: WdPropertyWithSurroundingDesc): FieldEntitiesContextTriples[] {
    const property = wdPropertyWithSurroundings.property;
    return [
        { field: "domain classes", values: property.generalConstraints.subjectTypeStats, context: wdPropertyWithSurroundings.surroundingClassesDescMap},
        { field: "range classes", values: property?.itemConstraints?.valueTypeStats ?? [], context: wdPropertyWithSurroundings.surroundingClassesDescMap},
        { field: "external identifier", values: property.equivalentExternalOntologyProperties }
    ]
}

export const WikidataPropertyDetailTab: React.FC<WikidataPropertyDetailTabProps> = ({wdProperty, onNewDetailEntity}) => {
    const { t } = useTranslation("detail")
    const { wdPropertyWithSurroundings, isLoading, isError } = useWdGetProperty(wdProperty);

    return (
        <>
            {isLoading && <WikidataLoading />}
            {isError && <WikidataLoadingError errorMessage={t("wikidata.error")} />}
            {!isLoading && !isError &&
                <WikidataEntityDetailGrid 
                    triples={createPropertyTriples(wdPropertyWithSurroundings)} 
                    onNewDetailEntity={onNewDetailEntity} 
                />  
            } 
        </>
    )
}