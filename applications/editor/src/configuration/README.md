# configuration

This directory contains configuration related functionality.

**Configuration** specifies which stores and how are used, what is allowed, context, backend adapter, etc.

There are two **configuration providers** currently. Configuration providers are React hooks that return configuration.
- **Provided configuration** is used when URL contains an IRI of data schema and data specification.
- **Local configuration** is used when the app is load as is, without the manager. It is used only for test and development purposes because the data are not stored anywhere.

**Adapters** are `CimAdapter` that can read data from the domain ontology database.
