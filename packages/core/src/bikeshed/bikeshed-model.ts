export class Bikeshed {

  metadata: Record<string, string> = {};

  content: BikeshedContent[] = [];

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

export class BikeshedContent {

  isSection(): this is BikeshedContentSection {
    return false;
  }

  isText(): this is BikeshedContentText {
    return false;
  }

  isList(): this is BikeshedContentList {
    return false;
  }

}

export class BikeshedContentSection extends BikeshedContent {

  readonly title: string | null;

  readonly anchor: string | null;

  content: BikeshedContent[] = [];

  constructor(title: string | null, anchor: string | null) {
    super();
    this.title = title;
    this.anchor = anchor;
  }

  isSection(): this is BikeshedContentSection {
    return true;
  }

}

export class BikeshedContentText extends BikeshedContent {

  /**
   * If text is null the content class is ignored.
   */
  readonly content: string | null;

  constructor(content: string | null) {
    super();
    this.content = content;
  }

  isText(): this is BikeshedContentText {
    return true;
  }

}

export class BikeshedContentList extends BikeshedContent {

  items: BikeshedContentListItem[] = [];

  isList(): this is BikeshedContentList {
    return true;
  }

}

export class BikeshedContentListItem {

  readonly title: string | null;

  content: string [] = [];

  constructor(title: string | null, content: string[] = []) {
    this.title = title;
    this.content = content;
  }

}
