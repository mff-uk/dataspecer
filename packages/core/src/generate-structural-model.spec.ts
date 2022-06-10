import {ReadOnlyMemoryStore,} from "./core";
import {coreResourcesToStructuralModel} from "./structure-model";
import {coreResourcesToConceptualModel} from "./conceptual-model";
import {transformStructureModel} from "./structure-model/transformation";

// todo Content of resources/merged_store.json from ZIP file
const resources = {
  "https://ofn.gov.cz/schema/1648759041130-d94d-717a-a12e": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Schema"
    ],
    "iri": "https://ofn.gov.cz/schema/1648759041130-d94d-717a-a12e",
    "pimHumanLabel": {
      "en": "Ukázka cli"
    },
    "pimHumanDescription": {},
    "pimParts": [
      "https://ofn.gov.cz/class/1648759049185-a201-64f2-872b",
      "https://ofn.gov.cz/attribute/1648759061777-7e3b-f9eb-b3bf",
      "https://ofn.gov.cz/attribute/1648759061789-7212-c5c1-a622",
      "https://ofn.gov.cz/class/1648759061801-e76f-d1e2-8b55",
      "https://ofn.gov.cz/class/1648759061804-5ee6-f86b-bdeb",
      "https://ofn.gov.cz/association/1648759061810-2df0-136e-9e16",
      "https://ofn.gov.cz/association-end/1648759061809-b59b-d96c-ab4d",
      "https://ofn.gov.cz/association-end/1648759061810-e3ba-25db-9d9f",
      "https://ofn.gov.cz/class/1648759077878-2fe9-b549-a2eb",
      "https://ofn.gov.cz/association/1648759077882-e8de-8dd4-a061",
      "https://ofn.gov.cz/association-end/1648759077881-2da4-a038-9a6b",
      "https://ofn.gov.cz/association-end/1648759077882-0bcd-6128-ae9a",
      "https://ofn.gov.cz/attribute/1648759084272-8c09-df77-982c",
      "https://ofn.gov.cz/attribute/1648760616635-2d37-ed8b-9138"
    ]
  },
  "https://ofn.gov.cz/class/1648759049185-a201-64f2-872b": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Class"
    ],
    "iri": "https://ofn.gov.cz/class/1648759049185-a201-64f2-872b",
    "pimInterpretation": "https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "en": "Tourist destination",
      "cs": "Turistický cíl"
    },
    "pimHumanDescription": {
      "en": "A separate tourist destination",
      "cs": "Samostatný turistický cíl."
    },
    "pimExtends": [
      "https://ofn.gov.cz/class/1648759061801-e76f-d1e2-8b55"
    ],
    "pimIsCodelist": false,
    "pimCodelistUrl": []
  },
  "https://ofn.gov.cz/attribute/1648759061777-7e3b-f9eb-b3bf": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Attribute"
    ],
    "iri": "https://ofn.gov.cz/attribute/1648759061777-7e3b-f9eb-b3bf",
    "pimInterpretation": "https://slovník.gov.cz/datový/turistické-cíle/pojem/kouření-povoleno",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "cs": "kouření povoleno",
      "en": "smoking allowed"
    },
    "pimHumanDescription": {
      "cs": "Určuje, zda je možné v turistickém cíli kouření tabákových výrobků.",
      "en": "Determines whether it is possible to smoke tobacco products in the tourist destination."
    },
    "pimDatatype": null,
    "pimOwnerClass": "https://ofn.gov.cz/class/1648759049185-a201-64f2-872b",
    "pimCardinalityMin": 0,
    "pimCardinalityMax": 1
  },
  "https://ofn.gov.cz/attribute/1648759061789-7212-c5c1-a622": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Attribute"
    ],
    "iri": "https://ofn.gov.cz/attribute/1648759061789-7212-c5c1-a622",
    "pimInterpretation": "https://slovník.gov.cz/datový/turistické-cíle/pojem/veřejná-přístupnost",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "en": "public accessibility",
      "cs": "veřejná přístupnost"
    },
    "pimHumanDescription": {
      "en": "Determines whether a tourist destination is open to the public.",
      "cs": "Určuje, zda je turistický cíl veřejně přístupný."
    },
    "pimDatatype": null,
    "pimOwnerClass": "https://ofn.gov.cz/class/1648759049185-a201-64f2-872b",
    "pimCardinalityMin": 0,
    "pimCardinalityMax": 1
  },
  "https://ofn.gov.cz/class/1648759061801-e76f-d1e2-8b55": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Class"
    ],
    "iri": "https://ofn.gov.cz/class/1648759061801-e76f-d1e2-8b55",
    "pimInterpretation": "https://slovník.gov.cz/generický/veřejná-místa/pojem/veřejné-místo",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "cs": "Veřejné místo",
      "en": "Public place"
    },
    "pimHumanDescription": {
      "en": "This class represents a publicly accessible place that is a point of interest for visitors.",
      "cs": "Tato třída reprezentuje veřejně dostupné místo, které je bodem zájmu návštěvníků."
    },
    "pimExtends": [],
    "pimIsCodelist": false,
    "pimCodelistUrl": []
  },
  "https://ofn.gov.cz/class/1648759061804-5ee6-f86b-bdeb": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Class"
    ],
    "iri": "https://ofn.gov.cz/class/1648759061804-5ee6-f86b-bdeb",
    "pimInterpretation": "https://slovník.gov.cz/generický/čas/pojem/časová-specifikace",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "cs": "Časová specifikace",
      "en": "Time specification"
    },
    "pimHumanDescription": {
      "cs": "Časová specifikace určuje množinu časových úseků pomocí různých způsobů (časový interval, specifický časový interval, frekvence a další). Výsledná množina časových úseků je průnikem těchto množin. Kromě níže specifikovaných vlastností a vazeb je možné u této třídy použít také vlastnosti a vazby třídy Věc.",
      "en": "A time specification defines a set of time periods using various methods (time interval, specific time interval, frequency, and more). The resulting set of time periods is the intersection of these sets. In addition to the properties and constraints specified below, the properties and constraints of the Thing class can also be applied to this class."
    },
    "pimExtends": [],
    "pimIsCodelist": false,
    "pimCodelistUrl": []
  },
  "https://ofn.gov.cz/association/1648759061810-2df0-136e-9e16": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Association"
    ],
    "iri": "https://ofn.gov.cz/association/1648759061810-2df0-136e-9e16",
    "pimInterpretation": "https://slovník.gov.cz/generický/veřejná-místa/pojem/má-otevírací-dobu",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "en": "has opening hours",
      "cs": "má otevírací dobu"
    },
    "pimHumanDescription": {
      "cs": "Strukturovaná specifikace otevírací doby veřejného místa.",
      "en": "A structured specification of the opening hours of a public place."
    },
    "pimIsOriented": false,
    "pimEnd": [
      "https://ofn.gov.cz/association-end/1648759061809-b59b-d96c-ab4d",
      "https://ofn.gov.cz/association-end/1648759061810-e3ba-25db-9d9f"
    ]
  },
  "https://ofn.gov.cz/association-end/1648759061809-b59b-d96c-ab4d": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/AssociationEnd"
    ],
    "iri": "https://ofn.gov.cz/association-end/1648759061809-b59b-d96c-ab4d",
    "pimInterpretation": null,
    "pimTechnicalLabel": null,
    "pimHumanLabel": null,
    "pimHumanDescription": null,
    "pimPart": "https://ofn.gov.cz/class/1648759061801-e76f-d1e2-8b55",
    "pimCardinalityMin": null,
    "pimCardinalityMax": null
  },
  "https://ofn.gov.cz/association-end/1648759061810-e3ba-25db-9d9f": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/AssociationEnd"
    ],
    "iri": "https://ofn.gov.cz/association-end/1648759061810-e3ba-25db-9d9f",
    "pimInterpretation": null,
    "pimTechnicalLabel": null,
    "pimHumanLabel": null,
    "pimHumanDescription": null,
    "pimPart": "https://ofn.gov.cz/class/1648759061804-5ee6-f86b-bdeb",
    "pimCardinalityMin": null,
    "pimCardinalityMax": null
  },
  "https://ofn.gov.cz/class/1648759077878-2fe9-b549-a2eb": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Class"
    ],
    "iri": "https://ofn.gov.cz/class/1648759077878-2fe9-b549-a2eb",
    "pimInterpretation": "https://slovník.gov.cz/generický/kontakty/pojem/kontakt",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "en": "Contact",
      "cs": "Kontakt"
    },
    "pimHumanDescription": {
      "cs": "Kontaktní údaje, např. na člověka, společnost, apod."
    },
    "pimExtends": [],
    "pimIsCodelist": false,
    "pimCodelistUrl": []
  },
  "https://ofn.gov.cz/association/1648759077882-e8de-8dd4-a061": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Association"
    ],
    "iri": "https://ofn.gov.cz/association/1648759077882-e8de-8dd4-a061",
    "pimInterpretation": "https://slovník.gov.cz/generický/veřejná-místa/pojem/má-kontakt",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "cs": "má kontakt",
      "en": "has contact"
    },
    "pimHumanDescription": {
      "cs": "Údaje pro kontaktování zástupce veřejného místa, např. provozovatele.",
      "en": "Details for contacting a representative of a public place, e.g. the operator."
    },
    "pimIsOriented": false,
    "pimEnd": [
      "https://ofn.gov.cz/association-end/1648759077881-2da4-a038-9a6b",
      "https://ofn.gov.cz/association-end/1648759077882-0bcd-6128-ae9a"
    ]
  },
  "https://ofn.gov.cz/association-end/1648759077881-2da4-a038-9a6b": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/AssociationEnd"
    ],
    "iri": "https://ofn.gov.cz/association-end/1648759077881-2da4-a038-9a6b",
    "pimInterpretation": null,
    "pimTechnicalLabel": null,
    "pimHumanLabel": null,
    "pimHumanDescription": null,
    "pimPart": "https://ofn.gov.cz/class/1648759061801-e76f-d1e2-8b55",
    "pimCardinalityMin": 0,
    "pimCardinalityMax": null
  },
  "https://ofn.gov.cz/association-end/1648759077882-0bcd-6128-ae9a": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/AssociationEnd"
    ],
    "iri": "https://ofn.gov.cz/association-end/1648759077882-0bcd-6128-ae9a",
    "pimInterpretation": null,
    "pimTechnicalLabel": null,
    "pimHumanLabel": null,
    "pimHumanDescription": null,
    "pimPart": "https://ofn.gov.cz/class/1648759077878-2fe9-b549-a2eb",
    "pimCardinalityMin": 0,
    "pimCardinalityMax": null
  },
  "https://ofn.gov.cz/attribute/1648759084272-8c09-df77-982c": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Attribute"
    ],
    "iri": "https://ofn.gov.cz/attribute/1648759084272-8c09-df77-982c",
    "pimInterpretation": "https://slovník.gov.cz/generický/kontakty/pojem/má-e-mailovou-adresu",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "cs": "má E-mailovou adresu",
      "en": "e-mail"
    },
    "pimHumanDescription": {
      "cs": "Kontaktní e-mailová adresa."
    },
    "pimDatatype": null,
    "pimOwnerClass": "https://ofn.gov.cz/class/1648759077878-2fe9-b549-a2eb",
    "pimCardinalityMin": 0,
    "pimCardinalityMax": 1
  },
  "https://ofn.gov.cz/attribute/1648760616635-2d37-ed8b-9138": {
    "types": [
      "https://ofn.gov.cz/slovník/pim/Attribute"
    ],
    "iri": "https://ofn.gov.cz/attribute/1648760616635-2d37-ed8b-9138",
    "pimInterpretation": "https://slovník.gov.cz/generický/kontakty/pojem/má-telefonní-číslo-na-pevnou-linku",
    "pimTechnicalLabel": null,
    "pimHumanLabel": {
      "cs": "má telefonní číslo na pevnou linku",
      "en": "phone number"
    },
    "pimHumanDescription": {
      "cs": "Telefonní číslo na pevnou linku."
    },
    "pimDatatype": null,
    "pimOwnerClass": "https://ofn.gov.cz/class/1648759077878-2fe9-b549-a2eb",
    "pimCardinalityMin": 0,
    "pimCardinalityMax": 1
  },
  "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb": {
    "types": [
      "https://ofn.gov.cz/slovník/psm/Schema"
    ],
    "iri": "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb",
    "dataPsmHumanLabel": {
      "cs": "Turistický cíl",
      "en": "Tourist destination"
    },
    "dataPsmHumanDescription": {
      "cs": "Datová struktura pro Turistický cíl. Samostatný turistický cíl.",
      "en": "Data structure for Tourist destination. A separate tourist destination"
    },
    "dataPsmTechnicalLabel": null,
    "dataPsmRoots": [
      "https://ofn.gov.cz/class/1648759049187-8d7a-1bbb-bc47"
    ],
    "dataPsmParts": [
      "https://ofn.gov.cz/class/1648759049187-8d7a-1bbb-bc47",
      "https://ofn.gov.cz/attribute/1648759061778-3c9e-6cae-9a1a",
      "https://ofn.gov.cz/attribute/1648759061789-1ff5-bc00-a656",
      "https://ofn.gov.cz/class/1648759077878-2b76-e187-b8e7",
      "https://ofn.gov.cz/association/1648759077883-6a7c-a38c-9588",
      "https://ofn.gov.cz/attribute/1648759084272-0b7a-ca9a-972d"
    ]
  },
  "https://ofn.gov.cz/class/1648759049187-8d7a-1bbb-bc47": {
    "types": [
      "https://ofn.gov.cz/slovník/psm/Class"
    ],
    "iri": "https://ofn.gov.cz/class/1648759049187-8d7a-1bbb-bc47",
    "dataPsmHumanLabel": null,
    "dataPsmHumanDescription": null,
    "dataPsmTechnicalLabel": "tourist_destination",
    "dataPsmInterpretation": "https://ofn.gov.cz/class/1648759049185-a201-64f2-872b",
    "dataPsmExtends": [],
    "dataPsmParts": [
      "https://ofn.gov.cz/attribute/1648759061778-3c9e-6cae-9a1a",
      "https://ofn.gov.cz/attribute/1648759061789-1ff5-bc00-a656",
      "https://ofn.gov.cz/association/1648759077883-6a7c-a38c-9588"
    ]
  },
  "https://ofn.gov.cz/attribute/1648759061778-3c9e-6cae-9a1a": {
    "types": [
      "https://ofn.gov.cz/slovník/psm/Attribute"
    ],
    "iri": "https://ofn.gov.cz/attribute/1648759061778-3c9e-6cae-9a1a",
    "dataPsmHumanLabel": null,
    "dataPsmHumanDescription": null,
    "dataPsmTechnicalLabel": "smoking_allowed",
    "dataPsmInterpretation": "https://ofn.gov.cz/attribute/1648759061777-7e3b-f9eb-b3bf",
    "dataPsmDatatype": null
  },
  "https://ofn.gov.cz/attribute/1648759061789-1ff5-bc00-a656": {
    "types": [
      "https://ofn.gov.cz/slovník/psm/Attribute"
    ],
    "iri": "https://ofn.gov.cz/attribute/1648759061789-1ff5-bc00-a656",
    "dataPsmHumanLabel": null,
    "dataPsmHumanDescription": null,
    "dataPsmTechnicalLabel": "public_accessibility",
    "dataPsmInterpretation": "https://ofn.gov.cz/attribute/1648759061789-7212-c5c1-a622",
    "dataPsmDatatype": null
  },
  "https://ofn.gov.cz/class/1648759077878-2b76-e187-b8e7": {
    "types": [
      "https://ofn.gov.cz/slovník/psm/Class"
    ],
    "iri": "https://ofn.gov.cz/class/1648759077878-2b76-e187-b8e7",
    "dataPsmHumanLabel": null,
    "dataPsmHumanDescription": null,
    "dataPsmTechnicalLabel": "contact",
    "dataPsmInterpretation": "https://ofn.gov.cz/class/1648759077878-2fe9-b549-a2eb",
    "dataPsmExtends": [],
    "dataPsmParts": [
      "https://ofn.gov.cz/attribute/1648759084272-0b7a-ca9a-972d"
    ]
  },
  "https://ofn.gov.cz/association/1648759077883-6a7c-a38c-9588": {
    "types": [
      "https://ofn.gov.cz/slovník/psm/AssociationEnd"
    ],
    "iri": "https://ofn.gov.cz/association/1648759077883-6a7c-a38c-9588",
    "dataPsmHumanLabel": null,
    "dataPsmHumanDescription": null,
    "dataPsmTechnicalLabel": "has_contact",
    "dataPsmInterpretation": "https://ofn.gov.cz/association-end/1648759077882-0bcd-6128-ae9a",
    "dataPsmPart": "https://ofn.gov.cz/class/1648759077878-2b76-e187-b8e7",
    "dataPsmIsDematerialize": null
  },
  "https://ofn.gov.cz/attribute/1648759084272-0b7a-ca9a-972d": {
    "types": [
      "https://ofn.gov.cz/slovník/psm/Attribute"
    ],
    "iri": "https://ofn.gov.cz/attribute/1648759084272-0b7a-ca9a-972d",
    "dataPsmHumanLabel": null,
    "dataPsmHumanDescription": null,
    "dataPsmTechnicalLabel": "e-mail",
    "dataPsmInterpretation": "https://ofn.gov.cz/attribute/1648759084272-8c09-df77-982c",
    "dataPsmDatatype": null
  }
};

// todo Content of resources/data_specification.json from ZIP file
const dataSpecifications = {
  "https://ofn.gov.cz/data-specification/c885c417-23f6-4f06-86dd-52e066c310de": {
    "iri": "https://ofn.gov.cz/data-specification/c885c417-23f6-4f06-86dd-52e066c310de",
    "pim": "https://ofn.gov.cz/schema/1648759041130-d94d-717a-a12e",
    "psms": [
      "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb"
    ],
    "importsDataSpecifications": [],
    "artefacts": [
      {
        "iri": "tourist-destination#jsonschema",
        "name": null,
        "outputPath": "ukazka-cli/tourist-destination/schema.json",
        "publicUrl": "ukazka-cli/tourist-destination/schema.json",
        "generator": "http://example.com/generator/json-schema",
        "configuration": null,
        "psm": "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb",
        "type": "schema"
      },
      {
        "iri": "tourist-destination#xmlschema",
        "name": null,
        "outputPath": "ukazka-cli/tourist-destination/schema.xsd",
        "publicUrl": "ukazka-cli/tourist-destination/schema.xsd",
        "generator": "http://example.com/generator/xml-schema",
        "configuration": null,
        "psm": "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb",
        "type": "schema"
      },
      {
        "iri": "tourist-destination#xsltlifting",
        "name": null,
        "outputPath": "ukazka-cli/tourist-destination/lifting.xslt",
        "publicUrl": "ukazka-cli/tourist-destination/lifting.xslt",
        "generator": "http://example.com/generator/xslt-lifting",
        "configuration": null,
        "psm": "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb",
        "type": "schema"
      },
      {
        "iri": "tourist-destination#xsltlowering",
        "name": null,
        "outputPath": "ukazka-cli/tourist-destination/lowering.xslt",
        "publicUrl": "ukazka-cli/tourist-destination/lowering.xslt",
        "generator": "http://example.com/generator/xslt-lowering",
        "configuration": null,
        "psm": "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb",
        "type": "schema"
      },
      {
        "iri": "tourist-destination#csvschema",
        "name": null,
        "outputPath": "ukazka-cli/tourist-destination/schema.csv-metadata.json",
        "publicUrl": "ukazka-cli/tourist-destination/schema.csv-metadata.json",
        "generator": "http://example.com/generator/csv-schema",
        "configuration": null,
        "psm": "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb",
        "type": "schema"
      },
      {
        "iri": null,
        "name": null,
        "outputPath": "ukazka-cli/conceptual-model.plantuml",
        "publicUrl": "ukazka-cli/conceptual-model.plantuml",
        "generator": "plant-uml",
        "configuration": null,
        "artefacts": [],
        "type": "documentation"
      },
      {
        "iri": null,
        "name": null,
        "outputPath": "ukazka-cli/conceptual-model.png",
        "publicUrl": "ukazka-cli/conceptual-model.png",
        "generator": "plant-uml/image",
        "configuration": null,
        "artefacts": [],
        "type": "documentation"
      },
      {
        "iri": null,
        "name": null,
        "outputPath": "ukazka-cli/documentation.bs",
        "publicUrl": "ukazka-cli/documentation.bs",
        "generator": "http://example.com/generator/bikeshed",
        "configuration": null,
        "artefacts": [
          "tourist-destination#jsonschema",
          "tourist-destination#xmlschema",
          "tourist-destination#xsltlifting",
          "tourist-destination#xsltlowering",
          "tourist-destination#csvschema"
        ],
        "type": "documentation"
      },
      {
        "iri": null,
        "name": null,
        "outputPath": "ukazka-cli/documentation.html",
        "publicUrl": "ukazka-cli/documentation.html",
        "generator": "http://example.com/generator/bikeshed/html-output",
        "configuration": null,
        "artefacts": [
          "tourist-destination#jsonschema",
          "tourist-destination#xmlschema",
          "tourist-destination#xsltlifting",
          "tourist-destination#xsltlowering",
          "tourist-destination#csvschema"
        ],
        "type": "documentation"
      }
    ],
    "pimStores": [
      {
        "type": "https://ofn.gov.cz/store-descriptor/http",
        "isReadOnly": false,
        "url": "https://api.dataspecer.mercadia.cz/store/d5963a15-3854-4828-bb0f-6e315890d7a1"
      }
    ],
    "psmStores": {
      "https://ofn.gov.cz/schema/1648759043832-c5fb-717c-b1cb": [
        {
          "type": "https://ofn.gov.cz/store-descriptor/http",
          "isReadOnly": false,
          "url": "https://api.dataspecer.mercadia.cz/store/0ab39846-df12-4dfe-b8e3-a76deef4c65c"
        }
      ]
    },
    "artefactConfiguration": [],
    "tags": [
      "Štěpán Stenchlák"
    ]
  }
};

// todo Modify these if needed

const dataSpecificationIri = Object.values(dataSpecifications)[0].iri;
const psmIri = dataSpecifications[dataSpecificationIri].psms[0];

test("Generate structural model.", async () => {
  const store = ReadOnlyMemoryStore.create(resources);
  const dataSpecification = dataSpecifications[dataSpecificationIri];

  const conceptualModel = await coreResourcesToConceptualModel(
      store,
      dataSpecification.pim
  );

  let structureModel = await coreResourcesToStructuralModel(
      store,
      psmIri
  );

  structureModel = transformStructureModel(
      conceptualModel,
      structureModel,
      Object.values(dataSpecifications)
  );

  // eslint-disable-next-line no-debugger
  debugger;
});
