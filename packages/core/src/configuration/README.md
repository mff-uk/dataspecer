# Generator configuration

Generators may be configured by various options. Because there can be an arbitrary number of generators, their options **shall be identified by IRIs** and shall be storable in RDF.

To efficiently work with those options, several adapters exist that convert RDF representation into a typed object. For example, adapter for XML options, or for JSON options. These adapters shall return `DeepPartial<C>`, where C is the configuration. There shall also be support for merging the configurations and the default one. With these, it is simple to use the default configuration and override only some options by merging.

```
                    XML option adapter
Rdf configuration ──────────────────────► Partial XML object configuration
                                                        │
                                                        ▼
Default configuration ──────────────────────────────► merge ───► merge ────►
                                                                   ▲
                                                                   │
User partial configuration as object ──────────────────────────────┘
```

For now, we use JS object instead of RDF configuration. Hence there are simpler adapters that only take the appropriate subobject.
