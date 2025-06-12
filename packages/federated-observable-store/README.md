@dataspecer/federated-observable-store
======================================

This package provides `FederatedObservableStore`.
 - federates multiple core stores (`CoreResourceReader`)
 - provides an interface for subscribing to modifications in the store
   - modifications by operations
   - _modifications by outside are not yet supported_
 - provides an interface for writing to the store

**See [individual source files](./src/) for detailed documentation.**

## Why do we need this store?

This store was implemented to overcome a few issues with `CoreResourceReader` and `CoreResourceWriter`, namely:
   - The interface of `CoreResourceWriter` can't be used with federated stores because it can't be derived from the operation in which store the operation should be executed. This is planned to be [fixed in the future](https://github.com/dataspecer/dataspecer/issues/151), enabling the creation of writeable federated stores easily.
   - React ecosystem needs to be notified about the changes. Either whether an operation made changes or the store changed itself.
   - Resource change notification batching is needed in some scenarios, mainly for large operations which can update a single resource multiple times, which would cause numerous re-renders of a React component.

## Basic usage

```ts
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";
const federatedObservableStore = new FederatedObservableStore();
```
```ts
// Register and unregister CoreResourceReader & CoreResourceWriter
federatedObservableStore.addStore(coreResourceReader);
federatedObservableStore.removeStore(coreResourceReader);
```
```ts
// Subscribe to the resource
const subscriber = (iri: string, resource: Resource) => {
    console.log(
        `Resource ${iri} has updated.`,
        `Loading: ${resource.isLoading ? "yes" : "no"}`,
        resource.resource
    );
}
federatedObservableStore.addSubscriber(iri, subscriber);
```
```ts
// Or use the CoreResourceReader interface directly
federatedObservableStore as CoreResourceReader;
```

## Applying operations
You can use part of the new interface according to [#151](https://github.com/dataspecer/dataspecer/issues/151) to apply core operations to the store.
```ts
const coreOperationResult = await federatedObservableStore.applyOperation(schemaIri, coreOperation);
```

For complex operations, `ComplexOperation` interface should be used to stress that the operations semantically belong together. Also, it may help to:
   - batch updates and notify subscribers after the complex operation was executed
   - rollback store if the operation fails
```ts
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

class MyComplexOperation implements ComplexOperation {
    private store!: FederatedObservableStore;
    
    setStore(store: FederatedObservableStore) {
        this.store = store;
    }
    
    async execute(): Promise<void> {
        ...
        await this.store.applyOperation(schema, operation);
        ...
    }
}

const op = new MyComplexOperation();
await federatedObservableStore.executeComplexOperation(op);
```
