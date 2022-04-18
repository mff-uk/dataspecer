import {createContext, useContext, useState} from "react";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

/**
 * The context that holds the FederatedObservableStore.
 */
export const StoreContext = createContext<FederatedObservableStore>(null);

/**
 * Creates a new FederatedObservableStore and return its value.
 */
export const useNewFederatedObservableStore = () => useState(new FederatedObservableStore())[0];

/**
 * Uses the FederatedObservableStore from the context.
 */
export const useFederatedObservableStore = () => useContext(StoreContext);
