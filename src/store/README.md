## Discussion: Regarding multiple stores and repository of common subtrees
During the modelling, the user may work with multiple stores, such as:
 - PIM store
 - Data PSM store
 - Read only store of common Data PSM subtrees
 - Another Data PSM and PIM store which is referenced from the current one

Because we may suppose, that IRIs are unique across all stores, it is possible to merge them into one store `FederatedObservableCoreModelReaderWriter` by looking through all the stores.

The only way to interact with a store is by executing an operation on it. (`ComplexOperation` is used) We are able to tell on which store the operation should be executed. It is because each operation manipulates with one main resource (for example modification of properties, changing order of its children). By knowing in which store the resource is, we can execute the operation on that store. The main resource must be specified.

### Aditional notes

1. User might want to name each store or open it as read-only. Therefore, the stores should be organised in some wrapping object with additional metadata.
2. You can subscribe for resource that does not exist. In that case, error is returned, but the CoreResourceLink is cached as any other.
