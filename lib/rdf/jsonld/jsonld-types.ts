//
// The schema is similar to JSON-LD expanded form, but with additional
// expansion of all keywords besides: @id, @type, @value, @language, @type.
//

export interface JsonLdResource {
  "@id": string;
}

export interface JsonLdEntity extends JsonLdResource {
  "@type"?: string[];
  // Plus all the properties.
}
