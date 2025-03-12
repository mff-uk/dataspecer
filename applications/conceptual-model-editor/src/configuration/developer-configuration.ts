import { Configuration } from "./configuration";
import { defaultConfiguration } from "./default-configuration";

export const developerConfiguration: Configuration = Object.freeze({
  ...defaultConfiguration,
  configurationName: "Developer",
  hideIdentifier: false,
  hideRelationCardinality: false,
});
