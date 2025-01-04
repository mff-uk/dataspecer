import { ListCapability, ListCapabilityMetadata } from "./list";
import { DetailCapability, DetailCapabilityMetadata } from "./detail";
import { DeleteInstanceCapability, DeleteInstanceCapabilityMetadata } from "./delete-instance";
import { CreateInstanceCapability, CreateInstanceCapabilityMetadata } from "./create-instance";
import { CapabilityGenerator } from "./capability-generator-interface";
import { EditInstanceCapability, EditInstanceCapabilityMetadata } from "./edit-instance";

const CAPABILITY_BASE_IRI = "https://dataspecer.com/application_graph/capability/" as const;
const LIST_CAPABILITY_ID = `${CAPABILITY_BASE_IRI}list` as const;
const DETAIL_CAPABILITY_ID = `${CAPABILITY_BASE_IRI}detail` as const;
const CREATE_CAPABILITY_ID = `${CAPABILITY_BASE_IRI}create-instance` as const;
const DELETE_CAPABILITY_ID = `${CAPABILITY_BASE_IRI}delete-instance` as const;
const EDIT_CAPABILITY_ID = `${CAPABILITY_BASE_IRI}edit-instance` as const;
export type CapabilityIdentifier = (
    typeof LIST_CAPABILITY_ID | typeof DETAIL_CAPABILITY_ID |
    typeof CREATE_CAPABILITY_ID | typeof DELETE_CAPABILITY_ID | typeof EDIT_CAPABILITY_ID
);

enum CapabilityType {
    Collection = "collection",
    Instance = "instance"
}

export function getCapabilityMetadata(targetIri: CapabilityIdentifier, humanLabel: string | undefined) {
    switch (targetIri) {
        case LIST_CAPABILITY_ID:
            return new ListCapabilityMetadata(humanLabel);
        case DETAIL_CAPABILITY_ID:
            return new DetailCapabilityMetadata(humanLabel);
        case CREATE_CAPABILITY_ID:
            return new CreateInstanceCapabilityMetadata(humanLabel);
        case DELETE_CAPABILITY_ID:
            return new DeleteInstanceCapabilityMetadata(humanLabel);
        case EDIT_CAPABILITY_ID:
            return new EditInstanceCapabilityMetadata(humanLabel);
        default:
            throw new Error(`Invalid target identifier: "${targetIri}"`);
    }
}

export {
    CapabilityGenerator,
    CapabilityType,
    ListCapability,
    DetailCapability,
    DeleteInstanceCapability,
    CreateInstanceCapability,
    EditInstanceCapability,
    LIST_CAPABILITY_ID,
    DETAIL_CAPABILITY_ID,
    CREATE_CAPABILITY_ID,
    DELETE_CAPABILITY_ID,
    EDIT_CAPABILITY_ID
}