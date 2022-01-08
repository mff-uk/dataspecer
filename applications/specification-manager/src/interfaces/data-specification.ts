import {DataStructure} from "./data-structure";

export interface DataSpecification {
    id: string;
    name?: string;
    pimStore: string;

    hasDataStructures: DataStructure[];

    reusesDataSpecification: DataSpecification[];
}
