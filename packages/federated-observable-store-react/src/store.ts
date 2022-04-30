import {createContext, useContext, useState} from "react";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

/**
 * React context that contains the instance of the {@link FederatedObservableStore}.
 */
export const StoreContext = createContext<FederatedObservableStore>(null);

/**
 * React hook to create new instance of the {@link FederatedObservableStore} that is memoized.
 *
 * Use this hook if you want to create new context with the store.
 */
export const useNewFederatedObservableStore = () => useState(new FederatedObservableStore())[0];

/**
 * React hook to access the instance of the {@link FederatedObservableStore} from the context.
 *
 * Use this hook to access the instance for operation execution, adding or removing stores, etc.
 */
export const useFederatedObservableStore = () => useContext(StoreContext);
