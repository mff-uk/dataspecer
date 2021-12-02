import {DocumentationModel} from "../documentation-model";

export class Bikeshed extends DocumentationModel {

  metadata: Record<string, string> = {};

}

/**
 * Predefined selected metadata keys.
 */
export enum BikeshedMetadataKeys {
  title = "Title",
  shortname = "Shortname",
  boilerplate = "Boilerplate",
  logo = "Logo",
  repository = "Repository",
  markup = "Markup Shorthands",
  level = "Level",
  status = "Status",
  group = "Group",
  url = "URL",
  editor = "Editor",
  abstract = "Abstract",
}
