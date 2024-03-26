export interface Capability {
    identifier: string;
    generateCapability(aggregateName: string): void;
    // implementation template
    // datasource required operations template
    // i.e. - overview              requires data read
    //      - new instance creation requires data write
    //      - update                requires data write
    //      - deletion              ~requires data write -> just id
    //          - capability can be decorable by another capability?
};
