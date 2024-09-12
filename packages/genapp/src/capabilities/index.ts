import { ListCapability } from "./list";
import { DetailCapability } from "./detail";
import { DeleteInstanceCapability } from "./delete-instance";
import { CreateInstanceCapability } from "./create-instance";
import { CapabilityGenerator } from "./capability-generator-interface";

const CAPABILITY_BASE_IRI = "https://dataspecer.com/application_graph/capability/";

enum CapabilityType {
    Collection = "collection",
    Instance = "instance"
}

export {
    CapabilityGenerator,
    CapabilityType,
    ListCapability,
    DetailCapability,
    DeleteInstanceCapability,
    CreateInstanceCapability,
    CAPABILITY_BASE_IRI
}