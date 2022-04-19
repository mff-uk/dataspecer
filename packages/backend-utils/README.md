@dataspecer/backend-utils
=========================

This library provides a set of tools and interfaces for communication with the
[services/backend](../../services/backend/) service.

**See [individual source files](./src/) for detailed documentation.**

*Note:* Currently only [services/backend](../../services/backend/) is supported as a storage for individual stores, data specifications and data schemas. We plan to support [SOLID](https://solidproject.org/) as well in the future, making the backend service optional.

This package contains:

- [connectors](./src/connectors) - classes to handle backend communication
- [interfaces](./src/interfaces)
- [store descriptors](./src/store-descriptor) - objects describing how the store should be constructed (remote url, how to handle updates, etc.)
- [stores](./src/stores) - implemented `CoreResourceReader & CoreResourceWriter` that fetches data from the backend service
