import {createContext} from "react";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

export const StoreContext = createContext<FederatedObservableStore>(null);
