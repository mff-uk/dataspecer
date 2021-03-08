import {
  EntityValidator,
  ValidatorClassReportEntry, ValidatorPropertyReportEntry,
  ValidatorReport
} from "./entity-validator-model";
import {ClassData, PropertyData, SchemaData} from "../entity-model";

export class ValidateTechnicalLabelIsSet implements EntityValidator {

  private result: ValidatorReport;

  private visited: Set<ClassData> = new Set<ClassData>();

  validate(schema: SchemaData): ValidatorReport {
    this.result = new ValidatorReport();
    this.visited.clear();
    for (const classData of schema.roots) {
      this.validateClass(classData);
    }
    const result = this.result;
    this.result = undefined;
    this.visited.clear();
    return result;
  }

  validateClass(classData: ClassData) {
    if (this.visited.has(classData)) {
      return;
    }
    this.visited.add(classData);
    if (classData.technicalLabel === undefined) {
      this.result.items.push(new ValidatorClassReportEntry(
        classData ,"'technicalLabel' is not set."));
    }
    for (const propertyData of classData.properties) {
      this.validateProperty(propertyData);
    }
  }

  validateProperty(propertyData: PropertyData) {
    if (propertyData.technicalLabel === undefined) {
      this.result.items.push(new ValidatorPropertyReportEntry(
        propertyData ,"'technicalLabel' is not set."));
    }
    for (const classType of propertyData.dataTypeClass) {
      this.validateClass(classType);
    }
  }

}
