import {StructureModel} from "../model";
import {clone} from "../../core";
import {DataSpecificationConfiguration} from "../../data-specification/configuration";

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