/**
 * This interface represents a configuration that can be passed to schema generator in URL parameter to configure its
 * behaviour during the startup. Configuration can change which stores are loaded, which CIM is used etc.
 */
export interface Configuration {
    stores: {
        store: ConfigurationStore,
        metadata: ConfigurationStoreMetadata,
    }[];
}

/**
 * Describes how store should be constructed
 */
export interface ConfigurationStore {
    type: string;
}

/**
 * Describes additional metadata about the store
 */
export interface ConfigurationStoreMetadata {
    tags: StoreMetadataTag[];
    artifacts?: StoreMetadataArtifact[];
}

export type StoreMetadataTag = ("root" | "pim" | "data-psm" | "cim-as-pim" | "reused" | "reused-recursively" | "read-only");
export type StoreMetadataArtifact = "xml" | "json";
