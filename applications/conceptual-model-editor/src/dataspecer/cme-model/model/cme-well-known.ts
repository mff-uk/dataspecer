
const codelistBase = "http://id.dataspecer.com/resource/code-list/"

export enum MandatoryLevel {

  mandatory = codelistBase + "requirement-level/items/mandatory/mandatory",

  recommended = codelistBase + "requirement-level/items/mandatory/recommended",

  optional = codelistBase + "requirement-level/items/mandatory/optional",
}

export enum ClassRole {

  main = codelistBase + "class-role/items/mandatory/main",

  supportive = codelistBase + "class-role/items/mandatory/supportive",

}
