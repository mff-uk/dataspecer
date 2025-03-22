# Configuration model

This directory contains interfaces and implementation for the configuration model. In general, by configuration in this context, we mean parameters for generators, documentation templates and other "metadata" that are still relevant for specifications and therefore are stored with other models and their changes may be tracked.

The idea is that the configuration is hierarchical JSON structure that can contain any data. One configuration can extend/patch other configurations.

Because the configuration needs to be serialized, we strictly distinguish between the serialization and the interpreted configuration. To actually read the given configuration, you need adapter that understands the configuration and can create nice JS objects. The serialization should use IRIs as keys to avoid collisions and maybe in the future use RDF representation.