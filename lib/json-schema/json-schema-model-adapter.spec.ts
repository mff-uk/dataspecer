import {objectModelToJsonSchema} from "./json-schema-model-adapter";
import {writeJsonSchema} from "./json-schema-writer";
import {
  coreResourcesToObjectModel, defaultStringSelector,
} from "../object-model";
import {CoreResource, ReadOnlyMemoryStore} from "../core";
import {MemoryOutputStream} from "../io/stream/memory-output-stream";

test("Convert to json-schema.", async () => {
  const resources = {
    "pim:schema/001": {
      "types": [
        "pim-schema"
      ],
      "iri": "pim:schema/001",
      "pimParts": [
        "pim:class/002",
        "pim:class/003",
        "pim:association/004",
        "pim:association-end/005",
        "pim:association-end/006",
        "pim:attribute/007",
        "pim:attribute/008",
        "pim:class/009",
        "pim:association/010",
        "pim:association-end/011",
        "pim:association-end/012",
        "pim:class/013",
        "pim:association/014",
        "pim:association-end/015",
        "pim:association-end/016"
      ]
    },
    "pim:class/002": {
      "types": [
        "pim-class"
      ],
      "iri": "pim:class/002",
      "pimExtends": [],
      "pimInterpretation": "https:slovník.gov.cz/datový/sportoviště/pojem/sportoviště",
      "pimHumanLabel": {
        "cs": "Sportoviště"
      },
      "pimHumanDescription": {}
    },
    "pim:class/003": {
      "types": [
        "pim-class"
      ],
      "iri": "pim:class/003",
      "pimExtends": [],
      "pimInterpretation": "https:slovník.gov.cz/generický/číselníky/pojem/typ-sportoviště",
      "pimHumanLabel": {
        "cs": "Typ sportoviště"
      },
      "pimHumanDescription": {}
    },
    "pim:association/004": {
      "types": [
        "pim-association"
      ],
      "iri": "pim:association/004",
      "pimEnd": [
        "pim:association-end/005",
        "pim:association-end/006"
      ],
      "pimInterpretation": "https:slovník.gov.cz/datový/sportoviště/pojem/má-typ-sportoviště",
      "pimHumanLabel": {
        "cs": "má typ sportoviště"
      },
      "pimHumanDescription": {
        "cs": "Specifikuje, o jaký typ sportoviště se jedná, např. stadion nebo sportovní hala."
      }
    },
    "pim:association-end/005": {
      "types": [
        "pim-association-end"
      ],
      "iri": "pim:association-end/005",
      "pimPart": "pim:class/002"
    },
    "pim:association-end/006": {
      "types": [
        "pim-association-end"
      ],
      "iri": "pim:association-end/006",
      "pimPart": "pim:class/003"
    },
    "pim:attribute/007": {
      "types": [
        "pim-attribute"
      ],
      "iri": "pim:attribute/007",
      "pimInterpretation": "https:slovník.gov.cz/datový/sportoviště/pojem/podmínky-užívání",
      "pimHumanLabel": {
        "cs": "podmínky užívání"
      },
      "pimHumanDescription": {
        "cs": "Podmínky užívání sportoviště."
      },
      "pimOwnerClass": "pim:class/002"
    },
    "pim:attribute/008": {
      "types": [
        "pim-attribute"
      ],
      "iri": "pim:attribute/008",
      "pimInterpretation": "https:slovník.gov.cz/datový/sportoviště/pojem/provozní-řád",
      "pimHumanLabel": {
        "cs": "provozní řád"
      },
      "pimHumanDescription": {
        "cs": "Znění provozního řádu sportoviště."
      },
      "pimOwnerClass": "pim:class/002"
    },
    "pim:class/009": {
      "types": [
        "pim-class"
      ],
      "iri": "pim:class/009",
      "pimExtends": [],
      "pimInterpretation": "https:slovník.gov.cz/generický/veřejná-místa/pojem/veřejné-místo",
      "pimHumanLabel": {
        "cs": "Veřejné místo"
      },
      "pimHumanDescription": {
        "cs": "Tato třída reprezentuje veřejně dostupné místo, které je bodem zájmu návštěvníků."
      }
    },
    "pim:association/010": {
      "types": [
        "pim-association"
      ],
      "iri": "pim:association/010",
      "pimEnd": [
        "pim:association-end/011",
        "pim:association-end/012"
      ],
      "pimInterpretation": "https:slovník.gov.cz/generický/veřejná-místa/pojem/má-otevírací-dobu",
      "pimHumanLabel": {
        "cs": "má otevírací dobu"
      },
      "pimHumanDescription": {
        "cs": "Strukturovaná specifikace otevírací doby veřejného místa."
      }
    },
    "pim:association-end/011": {
      "types": [
        "pim-association-end"
      ],
      "iri": "pim:association-end/011",
      "pimPart": "pim:class/009"
    },
    "pim:association-end/012": {
      "types": [
        "pim-association-end"
      ],
      "iri": "pim:association-end/012",
      "pimPart": "pim:class/002"
    },
    "pim:class/013": {
      "types": [
        "pim-class"
      ],
      "iri": "pim:class/013",
      "pimExtends": [],
      "pimInterpretation": "https:slovník.gov.cz/generický/veřejná-místa/pojem/veřejné-místo",
      "pimHumanLabel": {
        "cs": "Veřejné místo"
      },
      "pimHumanDescription": {
        "cs": "Tato třída reprezentuje veřejně dostupné místo, které je bodem zájmu návštěvníků."
      }
    },
    "pim:association/014": {
      "types": [
        "pim-association"
      ],
      "iri": "pim:association/014",
      "pimEnd": [
        "pim:association-end/015",
        "pim:association-end/016"
      ],
      "pimInterpretation": "https:slovník.gov.cz/generický/veřejná-místa/pojem/má-provozovatele",
      "pimHumanLabel": {
        "cs": "má provozovatele"
      },
      "pimHumanDescription": {
        "cs": "Provozovatel veřejného místa."
      }
    },
    "pim:association-end/015": {
      "types": [
        "pim-association-end"
      ],
      "iri": "pim:association-end/015",
      "pimPart": "pim:class/013"
    },
    "pim:association-end/016": {
      "types": [
        "pim-association-end"
      ],
      "iri": "pim:association-end/016",
      "pimPart": "pim:class/002"
    },
    "dataPsm:schema/017": {
      "types": [
        "data-psm-schema"
      ],
      "iri": "dataPsm:schema/017",
      "dataPsmRoots": [
        "dataPsm:class/018"
      ],
      "dataPsmParts": [
        "dataPsm:class/018",
        "dataPsm:class/019",
        "dataPsm:association/020",
        "dataPsm:attribute/023",
        "dataPsm:attribute/021",
        "dataPsm:class/024",
        "dataPsm:association/022",
        "dataPsm:class/025",
        "dataPsm:association/026"
      ]
    },
    "dataPsm:class/018": {
      "types": [
        "data-psm-class"
      ],
      "iri": "dataPsm:class/018",
      "dataPsmExtends": [],
      "dataPsmParts": [
        "dataPsm:association/020",
        "dataPsm:attribute/023",
        "dataPsm:attribute/021",
        "dataPsm:association/022",
        "dataPsm:association/026"
      ],
      "dataPsmInterpretation": "pim:class/002"
    },
    "dataPsm:class/019": {
      "types": [
        "data-psm-class"
      ],
      "iri": "dataPsm:class/019",
      "dataPsmExtends": [],
      "dataPsmParts": [],
      "dataPsmInterpretation": "pim:class/003"
    },
    "dataPsm:association/020": {
      "types": [
        "data-psm-association-end"
      ],
      "iri": "dataPsm:association/020",
      "dataPsmInterpretation": "pim:association-end/006",
      "dataPsmPart": "dataPsm:class/019"
    },
    "dataPsm:attribute/023": {
      "types": [
        "data-psm-attribute"
      ],
      "iri": "dataPsm:attribute/023",
      "dataPsmInterpretation": "pim:attribute/007"
    },
    "dataPsm:attribute/021": {
      "types": [
        "data-psm-attribute"
      ],
      "iri": "dataPsm:attribute/021",
      "dataPsmInterpretation": "pim:attribute/008"
    },
    "dataPsm:class/024": {
      "types": [
        "data-psm-class"
      ],
      "iri": "dataPsm:class/024",
      "dataPsmExtends": [],
      "dataPsmParts": [],
      "dataPsmInterpretation": "pim:class/009"
    },
    "dataPsm:association/022": {
      "types": [
        "data-psm-association-end"
      ],
      "iri": "dataPsm:association/022",
      "dataPsmInterpretation": "pim:association-end/011",
      "dataPsmPart": "dataPsm:class/024"
    },
    "dataPsm:class/025": {
      "types": [
        "data-psm-class"
      ],
      "iri": "dataPsm:class/025",
      "dataPsmExtends": [],
      "dataPsmParts": [],
      "dataPsmInterpretation": "pim:class/013"
    },
    "dataPsm:association/026": {
      "types": [
        "data-psm-association-end"
      ],
      "iri": "dataPsm:association/026",
      "dataPsmInterpretation": "pim:association-end/015",
      "dataPsmPart": "dataPsm:class/025"
    }
  };
  const store = ReadOnlyMemoryStore.create(
    resources as { [iri: string]: CoreResource }
  );
  const objectModel = await coreResourcesToObjectModel(
    store, "dataPsm:schema/017");
  const actual = objectModelToJsonSchema(
    objectModel, defaultStringSelector);
  console.log(JSON.stringify(objectModel, null, 2));
  console.log(JSON.stringify(actual, null, 2));
  const stream = new MemoryOutputStream();
  await writeJsonSchema(actual, stream)
  console.log(stream.getContent());
});
