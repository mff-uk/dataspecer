import {DataSpecificationArtefact} from "@dataspecer/core/data-specification/model/data-specification-artefact";

/**
 * Represents object that is returned when generate state is changed.
 */
export type GenerateReport = {
  artifact: DataSpecificationArtefact;
  state: "pending" | "progress" | "success" | "error";
  error: Error | null;
}[];
