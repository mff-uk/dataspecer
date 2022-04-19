@dataspecer/federated-observable-store-react
============================================

React hooks and utils for painless work with [@dataspecer/federated-observable-store](../federated-observable-store) in the React ecosystem. Please see the documentation of `FederatedObservableStore` for more information. This file documents only how to use the store with React.

The `FederatedObservableStore` is designed to be easily integrated with React state mechanism thanks to the observer pattern, which notifies React about all changes in the store. This is achieved through the `useResource` hook, which uses `StoreContext` and retrieves the resource info. It can handle the loading of the resource, updates through operations, and manipulation with stores.

**See [individual source files](./src/) for detailed documentation.**

## Example use

Example shows a simple React component with input where user can type IRI of resource, which is then showed below. If the store is asynchronous, the loading text is displayed. The resource is automatically updated if you execute an operation through the `FederatedObservableStore`.

```tsx
import React from "react";
import {useNewFederatedObservableStore, StoreContext} from "@dataspecer/federated-observable-store-react/store";
import {CoreResourceReader, CoreResourceWriter} from "@dataspecer/core/core";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";

// This is your core store, that will be managed by FederatedObservableStore and accessed by React
const yourCoreStore: CoreResourceReader & CoreResourceWriter = ...;

const App: React.FC = () => {
    // 1. Create FederatedObservableStore by calling a hook that will create and memoize a new instance for you
    const store = useNewFederatedObservableStore();

    React.useEffect(() => {
        // 2. Register your CoreStore. You can register multiple stores and remove them freely. Everything will be automatically updated.
        store.addStore(yourCoreStore);
    }, [store]);

    const [iri, setIri] = React.useState<string>("");

    return <StoreContext.Provider value={store}>
        Type IRI: <input value={iri} onChange={e => setIri(e.target.value)}/>
        <ShowResourceInfo iri={iri} />
    </StoreContext.Provider>
}

const ShowResourceInfo: React.FC<{iri: string}> = ({iri}) => {
    // 3. Use resource with automatic handling of changes and loading. If you know the type, you can specify it as a type parameter of the hook
    const {resource, isLoading} = useResource(iri);

    if (isLoading) {
        return <div>Loading...</div>
    } else {
        return <div>{JSON.stringify(resource)}</div>
    }
};

// 4. Try to apply operation to see that the resource is updated
store.applyOperation(...);
```
