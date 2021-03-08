import {ClassData, PropertyData, SchemaData} from "../entity-model";

export interface EntityValidator {

  validate(schema: SchemaData): ValidatorReport;

}

export class ValidatorReport {

  items: ValidatorReportEntry[] = [];

}

export class ValidatorReportEntry {

  readonly message: string;

  constructor(message: string) {
    this.message = message;
  }

}

export class ValidatorClassReportEntry extends ValidatorReportEntry {

  readonly reference: ClassData;

  constructor(reference: ClassData, message: string) {
    super(message);
    this.reference = reference;
  }

}

export class ValidatorPropertyReportEntry extends ValidatorReportEntry {

  readonly reference: PropertyData;

  constructor(reference: PropertyData, message: string) {
    super(message);
    this.reference = reference;
  }

}
