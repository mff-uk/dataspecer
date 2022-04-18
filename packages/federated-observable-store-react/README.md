@dataspecer/federated-observable-store-react
===================================================

React hooks and utils for easy work with @dataspecer/federated-observable-store.

## Example use

```tsx
import React from "react";
import {useNewFederatedObservableStore, StoreContext} from "@dataspecer/federated-observable-store-react/store";
import {CoreResourceReader, CoreResourceWriter} from "@dataspecer/core/core";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";

const yourCoreStore: CoreResourceReader & CoreResourceWriter = ...;

const App: React.FC = () => {
    // 1. Create federated observable store
    const store = useNewFederatedObservableStore();

    // 2. Register your stores
    React.useEffect(() => {
        store.addStore(yourCoreStore);
    }, [store]);

    const [iri, setIri] = React.useState<string>("");

    return <StoreContext.Provider value={store}>
        Type IRI: <input value={iri} onChange={e => setIri(e.target.value)}/>
        <ShowResourceInfo iri={iri} />
    </StoreContext.Provider>
}

const ShowResourceInfo: React.FC<{iri: string}> = ({iri}) => {
    // 3. Use resource with automatic handling of changes and loading
    const {resource, isLoading} = useResource(iri);

    if (isLoading) {
        return <div>Loading...</div>
    } else {
        return <div>{JSON.stringify(resource)}</div>
    }
};

// 4. Try to apply operation to see that resource is updated
store.applyOperation(...);
```
