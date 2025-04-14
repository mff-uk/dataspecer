import {StructureModel} from "../model/index.ts";
import {clone} from "../../core/index.ts";
import {DataSpecificationConfiguration} from "../../data-specification/configuration.ts";

export function structureModelAddDefaultValues(
    structure: StructureModel,
    configuration: DataSpecificationConfiguration,
): StructureModel {
    const result = clone(structure) as StructureModel;
    const classes = result.getClasses();
    for (const classData of classes) {
        classData.instancesHaveIdentity ??= configuration.instancesHaveIdentity;
        classData.instancesSpecifyTypes ??= configuration.instancesSpecifyTypes;
        classData.isClosed ??= configuration.dataPsmIsClosed == "CLOSED";
    }
    return result;
}