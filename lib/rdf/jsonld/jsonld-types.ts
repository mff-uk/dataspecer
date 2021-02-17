//
// The schema is similar to JSON-LD expanded form, but with additional
// expansion of all keywords besides: @id, @type, @value, @language, @type.
//

export type JsonLdResource = {
  "@id": string;
};

export type JsonLdEntity =
  JsonLdResource
  & { "@type"?: string[] }
  & { [key: string]: any };

export type JsonLdValue = string | number | boolean;

export type Literal = { [language: string]: string };
