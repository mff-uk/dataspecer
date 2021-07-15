import {WebSpecification} from "../web-specification/web-specification-model";

export class Bikeshed extends  WebSpecification {

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
