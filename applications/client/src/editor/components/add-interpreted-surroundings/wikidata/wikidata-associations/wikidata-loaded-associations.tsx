import { WdEntityId } from '@dataspecer/wikidata-experimental-adapter';
import { useWdGetSurroundings } from '../helper/use-get-surroundings';
import { LoadingDialog } from '../../../helper/LoadingDialog';
import { LoadingError } from '../helper/loading-error';
import { WikidataAssociations } from './wikidata-associations';

export interface WikidataLoadedAssociationsProperties {
  selectedWdClassId: WdEntityId;
}

export const WikidataLoadedAssociations: React.FC<WikidataLoadedAssociationsProperties> = ({selectedWdClassId}) => {
  const {wdClassSurroundings: selectedWdClassSurroundings, isLoading, isError} = useWdGetSurroundings(selectedWdClassId);

  return (
    <>
      {isLoading && <LoadingDialog />}
      {isError && <LoadingError />}
      {!isLoading && !isError && <WikidataAssociations wdClassSurroundings={selectedWdClassSurroundings}/>}
    </>
  );
}
