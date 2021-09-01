import {CoreResource} from "model-driven-data/core";
import {useEffect, useState} from "react";
import {ModelObserverContainer, ModelObserverContainerResourceState} from "../ModelObserverContainer";

/**
 * Loads resource from the model. NULL stands for missing resource in the model. Undefined is set during loading and
 * when the iri is not set.
 */
export const useResourceFromModel = <ResourceType extends CoreResource>(iri: string | null, model: ModelObserverContainer): ModelObserverContainerResourceState<ResourceType> => {
    const [state, setState] = useState<ModelObserverContainerResourceState>({
        resource: undefined,
        isError: false,
        isLoading: true,
    });

    useEffect(() => {
        if (iri) {
            const oldModel = model;
            model.addSubscriber(iri, setState);
            return () => oldModel.removeSubscriber(iri, setState);
        } else {
            setState({
                resource: undefined,
                isLoading: false,
                isError: false,
            });
        }
    }, [iri, model]);

    return state as ModelObserverContainerResourceState<ResourceType>;
};
