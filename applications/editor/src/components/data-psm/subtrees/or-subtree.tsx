import React, {memo, useCallback, useMemo} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmOr} from "@dataspecer/core/data-psm/model";
import {Collapse} from "@mui/material";
import {TransitionGroup} from "react-transition-group";
import {DataPsmObjectType, ORContext} from "../data-psm-row";
import {DataPsmDeleteButton} from "../class/DataPsmDeleteButton";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {DeleteChoice} from "../../../operations/delete-choice";

export const DataPsmOrSubtree: React.FC<{iri: string, isOpen: boolean}> = memo(({iri, isOpen}) => {
  const {resource} = useResource<DataPsmOr>(iri);

  const context = useMemo(() => ({
    contextType: "or",
    parentDataPsmOrIri: iri,
  } as ORContext), [iri]);

  const store = useFederatedObservableStore();

  const deleteChoice = useCallback((index: number) => {
    store.executeComplexOperation(new DeleteChoice(iri, index))
  }, [store, iri]);

  return <Collapse in={isOpen} unmountOnExit>
    <ul>
      {resource &&
      <TransitionGroup exit={false}>
        {resource.dataPsmChoices.map((iri, index) => <Collapse key={iri}>
          <DataPsmObjectType iri={iri} context={context} menu={[
            <DataPsmDeleteButton onClick={() => deleteChoice(index)} />
          ]} />
        </Collapse>)}
      </TransitionGroup>
      }
    </ul>
  </Collapse>;
});
