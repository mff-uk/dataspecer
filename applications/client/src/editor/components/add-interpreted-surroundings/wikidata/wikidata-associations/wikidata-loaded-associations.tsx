import { WdEntityId, WdFilterByInstance } from '@dataspecer/wikidata-experimental-adapter';
import { useWdGetSurroundings } from '../helpers/use-get-surroundings';
import { LoadingDialog } from '../../../helper/LoadingDialog';
import { LoadingError } from '../helpers/loading-error';
import { WikidataAssociations } from './wikidata-associations';
import { useTranslation } from 'react-i18next';

export interface WikidataLoadedAssociationsProperties {
    selectedWdClassId: WdEntityId;
    wdFilterByInstance: WdFilterByInstance | undefined;
    searchText: string;
    includeInheritedProperties: boolean;
}

export const WikidataLoadedAssociations: React.FC<WikidataLoadedAssociationsProperties> = (props) => {
    const {t} = useTranslation("interpretedSurrounding");
    const {wdClassSurroundings: selectedWdClassSurroundings, isLoading, isError} = useWdGetSurroundings(props.selectedWdClassId);

    return (
        <>
            {isLoading && <LoadingDialog />}
            {isError && <LoadingError errorMessage={t("no associations no attributes")} />}
            {!isLoading && !isError && <WikidataAssociations 
                selectedWdClassSurroundings={selectedWdClassSurroundings}
                wdFilterByInstance={props.wdFilterByInstance}
                searchText={props.searchText}
                includeInheritedProperties={props.includeInheritedProperties}
            />}
        </>
    );
}
