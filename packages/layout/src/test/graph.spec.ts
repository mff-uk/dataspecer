import { LanguageString, NamedThing, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { GraphClassic } from "../graph-iface";
import { ExtractedModel, extractModelObjects } from "../layout-iface";
import { DIRECTION, findBestLayout, doFindBestLayout, UserGivenConstraintsVersion2 } from "..";
import { ReactflowDimensionsEstimator } from "../reactflow-dimension-estimator";
import { VisualEntities } from "../../../core-v2/lib/visual-model/visual-entity";

type PossibleSemanticModelEntity = SemanticModelClass | SemanticModelRelationship | SemanticModelGeneralization;


export function tryCreateClassicGraph() {
    console.log("Calling tryCreateClassicGraph");
    const graph = new GraphClassic(testGraph);
    extractModelObjects(testGraph);

    console.log("OUTPUT GRAPH:");
    console.log(graph);
}

const removeIdField = (obj: object) => {
  // ChatGPT
  for (const key in obj) {
    if (obj[key].id) {
      delete obj[key].id;  // Remove the 'id' field
    }
  }
}

test("Test Correctness against first (well actually second) implementation", async () => {
    for(const [_, {config, result}] of Object.entries(configs)) {
        const newResult = await doFindBestLayout(testGraph, config, new ReactflowDimensionsEstimator());
        removeIdField(newResult);
        removeIdField(result);
        expect(newResult).toEqual(result);
    };
});


// Test-Str2 Directory ... iawx6
// 4ede7c75-0844-4d47-995f-b8b327e9b9a9
const testGraph: Record<string, PossibleSemanticModelEntity> = {
    "1qbzed7ex0ulx4wuzb6": {
      "id": "1qbzed7ex0ulx4wuzb6",
      "iri": "jolly-kid",
      "type": [
        "class"
      ],
      "name": {
        "en": "Jolly Kid"
      },
      "description": {}
    },
    "0a1bwjw3tradlx4wv0sh": {
      "id": "0a1bwjw3tradlx4wv0sh",
      "iri": "frantic-name",
      "type": [
        "class"
      ],
      "name": {
        "en": "Frantic Name"
      },
      "description": {}
    },
    "vuyjc4u189lx4wv1z9": {
      "id": "vuyjc4u189lx4wv1z9",
      "iri": "burly-study",
      "type": [
        "class"
      ],
      "name": {
        "en": "Burly Study"
      },
      "description": {}
    },
    "7jsefe4r2nlx4wv3fn": {
      "id": "7jsefe4r2nlx4wv3fn",
      "iri": "fresh-week",
      "type": [
        "class"
      ],
      "name": {
        "en": "Fresh Week"
      },
      "description": {}
    },
    "wbkqiz6jr2lx4wv57v": {
      "id": "wbkqiz6jr2lx4wv57v",
      "iri": "eager-state",
      "type": [
        "class"
      ],
      "name": {
        "en": "Eager State"
      },
      "description": {}
    },
    "mbutp4km4elx4wv6eq": {
      "id": "mbutp4km4elx4wv6eq",
      "iri": "chubby-problem",
      "type": [
        "class"
      ],
      "name": {
        "en": "Chubby Problem"
      },
      "description": {}
    },
    "oimo8cnbqwslx4wv7q8": {
      "id": "oimo8cnbqwslx4wv7q8",
      "iri": "gritty-job",
      "type": [
        "class"
      ],
      "name": {
        "en": "Gritty Job"
      },
      "description": {}
    },
    "kfkq6pzv59glx4wv8l8": {
      "id": "kfkq6pzv59glx4wv8l8",
      "iri": "bulky-case",
      "type": [
        "class"
      ],
      "name": {
        "en": "Bulky Case"
      },
      "description": {}
    },
    "y1r4gw5kvmnlx4wv9vf": {
      "id": "y1r4gw5kvmnlx4wv9vf",
      "iri": "testy-eye",
      "type": [
        "class"
      ],
      "name": {
        "en": "Testy Eye"
      },
      "description": {}
    },
    "rpwh80760ialx4wvaxo": {
      "id": "rpwh80760ialx4wvaxo",
      "iri": "upset-minute",
      "type": [
        "class"
      ],
      "name": {
        "en": "Upset Minute"
      },
      "description": {}
    },
    "1hxrzx2indvlx4wvcae": {
      "id": "1hxrzx2indvlx4wvcae",
      "iri": "bulky-body",
      "type": [
        "class"
      ],
      "name": {
        "en": "Bulky Body"
      },
      "description": {}
    },
    "r4n06ifqx19lx4wvddr": {
      "id": "r4n06ifqx19lx4wvddr",
      "iri": "healthy-year",
      "type": [
        "class"
      ],
      "name": {
        "en": "Healthy Year"
      },
      "description": {}
    },
    "lfmsdy2jg8jlx4wveir": {
      "id": "lfmsdy2jg8jlx4wveir",
      "iri": "grumpy-point",
      "type": [
        "class"
      ],
      "name": {
        "en": "Grumpy Point"
      },
      "description": {}
    },
    "57pfr9zj5mtlx4wvfkf": {
      "id": "57pfr9zj5mtlx4wvfkf",
      "iri": "cumbersome-research",
      "type": [
        "class"
      ],
      "name": {
        "en": "Cumbersome Research"
      },
      "description": {}
    },
    "j7xhjbcb3zqlx4wvh8z": {
      "id": "j7xhjbcb3zqlx4wvh8z",
      "iri": "itchy-line",
      "type": [
        "class"
      ],
      "name": {
        "en": "Itchy Line"
      },
      "description": {}
    },
    "os2060nmi18lx4wvi86": {
      "id": "os2060nmi18lx4wvi86",
      "iri": "pompous-father",
      "type": [
        "class"
      ],
      "name": {
        "en": "Pompous Father"
      },
      "description": {}
    },
    "z52sbt22y19lx4wvn1w": {
      "id": "z52sbt22y19lx4wvn1w",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "y1r4gw5kvmnlx4wv9vf",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "os2060nmi18lx4wvi86",
          "iri": "b08ef0fe1488c4"
        }
      ]
    },
    "8jw15sybg0plx4wvzcz": {
      "id": "8jw15sybg0plx4wvzcz",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "y1r4gw5kvmnlx4wv9vf",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "vuyjc4u189lx4wv1z9",
          "iri": "32d5692c0a247d"
        }
      ]
    },
    "o4lyrjtz5hqlx4ww344": {
      "id": "o4lyrjtz5hqlx4ww344",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "y1r4gw5kvmnlx4wv9vf",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "j7xhjbcb3zqlx4wvh8z",
          "iri": "d277206ef07805"
        }
      ]
    },
    "vpnsd8x8whlx4ww79f": {
      "id": "vpnsd8x8whlx4ww79f",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "y1r4gw5kvmnlx4wv9vf",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "57pfr9zj5mtlx4wvfkf",
          "iri": "404453390eaa3f"
        }
      ]
    },
    "3yotesnuw3xlx4wwiph": {
      "id": "3yotesnuw3xlx4wwiph",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "57pfr9zj5mtlx4wvfkf",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "os2060nmi18lx4wvi86",
          "iri": "3c092af53f47c2"
        }
      ]
    },
    "7ak55umkpzflx4wwm7e": {
      "id": "7ak55umkpzflx4wwm7e",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "vuyjc4u189lx4wv1z9",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "os2060nmi18lx4wvi86",
          "iri": "0568ac4dcc09a8"
        }
      ]
    },
    "g8dll2e4rnblx4wwrxg": {
      "id": "g8dll2e4rnblx4wwrxg",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "j7xhjbcb3zqlx4wvh8z",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "kfkq6pzv59glx4wv8l8",
          "iri": "1a85cb832a6000"
        }
      ]
    },
    "rc22atgjjwglx4wwyb5": {
      "id": "rc22atgjjwglx4wwyb5",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "kfkq6pzv59glx4wv8l8",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "mbutp4km4elx4wv6eq",
          "iri": "9fe7661545e132"
        }
      ]
    },
    "bjsk6ioswbclx4wx219": {
      "id": "bjsk6ioswbclx4wx219",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "kfkq6pzv59glx4wv8l8",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "wbkqiz6jr2lx4wv57v",
          "iri": "dc0a69e091fb28"
        }
      ]
    },
    "59sqo2xxug7lx4wx748": {
      "id": "59sqo2xxug7lx4wx748",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "kfkq6pzv59glx4wv8l8",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "lfmsdy2jg8jlx4wveir",
          "iri": "59174f7be2a913"
        }
      ]
    },
    "vw1bbe4gt1llx4wxazj": {
      "id": "vw1bbe4gt1llx4wxazj",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "wbkqiz6jr2lx4wv57v",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "mbutp4km4elx4wv6eq",
          "iri": "213ab88168397a"
        }
      ]
    },
    "0fnju14x6snolx4wxeae": {
      "id": "0fnju14x6snolx4wxeae",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "wbkqiz6jr2lx4wv57v",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "7jsefe4r2nlx4wv3fn",
          "iri": "be1b5afc1fba0c"
        }
      ]
    },
    "wzreqoybr1olx4wxgnq": {
      "id": "wzreqoybr1olx4wxgnq",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "wbkqiz6jr2lx4wv57v",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "lfmsdy2jg8jlx4wveir",
          "iri": "d20e04df28377a"
        }
      ]
    },
    "w7h2xpuwemmlx4wxkg7": {
      "id": "w7h2xpuwemmlx4wxkg7",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "r4n06ifqx19lx4wvddr",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "kfkq6pzv59glx4wv8l8",
          "iri": "36f54495b6eb7b"
        }
      ]
    },
    "ty0x6y9lj3flx4wxmwx": {
      "id": "ty0x6y9lj3flx4wxmwx",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1hxrzx2indvlx4wvcae",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "lfmsdy2jg8jlx4wveir",
          "iri": "5369c0f0a7749f"
        }
      ]
    },
    "ui8a53uarrslx4wxqmn": {
      "id": "ui8a53uarrslx4wxqmn",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1hxrzx2indvlx4wvcae",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "rpwh80760ialx4wvaxo",
          "iri": "e74f61ac31894a"
        }
      ]
    },
    "ch14ymkds69lx4wxtd0": {
      "id": "ch14ymkds69lx4wxtd0",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "rpwh80760ialx4wvaxo",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "vuyjc4u189lx4wv1z9",
          "iri": "1aa8d22479f723"
        }
      ]
    },
    "s6uiof2dbxlx4wxvzn": {
      "id": "s6uiof2dbxlx4wxvzn",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1hxrzx2indvlx4wvcae",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "y1r4gw5kvmnlx4wv9vf",
          "iri": "bc8bc73fa3a771"
        }
      ]
    },
    "4o0wqr6c3dlx4wxyv9": {
      "id": "4o0wqr6c3dlx4wxyv9",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "rpwh80760ialx4wvaxo",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "7jsefe4r2nlx4wv3fn",
          "iri": "9d232408fc6caf"
        }
      ]
    },
    "sc4a014i5clx4wy2dh": {
      "id": "sc4a014i5clx4wy2dh",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1qbzed7ex0ulx4wuzb6",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "0a1bwjw3tradlx4wv0sh",
          "iri": "092ad441bb18a8"
        }
      ]
    },
    "2hw43omp6zllx4wy68m": {
      "id": "2hw43omp6zllx4wy68m",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1qbzed7ex0ulx4wuzb6",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "oimo8cnbqwslx4wv7q8",
          "iri": "a3c3c5b09a9753"
        }
      ]
    },
    "aftyc97dgtnlx4wybc5": {
      "id": "aftyc97dgtnlx4wybc5",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "oimo8cnbqwslx4wv7q8",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "0a1bwjw3tradlx4wv0sh",
          "iri": "a6b33a980ce3f9"
        }
      ]
    },
    "hy5wzmclaglx4wyff7": {
      "id": "hy5wzmclaglx4wyff7",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "0a1bwjw3tradlx4wv0sh",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "lfmsdy2jg8jlx4wveir",
          "iri": "5895de9adf9e2b"
        }
      ]
    },
    "xq4gxjqopsflx4wym9w": {
      "id": "xq4gxjqopsflx4wym9w",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "kfkq6pzv59glx4wv8l8",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1qbzed7ex0ulx4wuzb6",
          "iri": "64edff72dc3ea9"
        }
      ]
    },
    "yqlbp4jxorlx4x0eqe": {
      "id": "yqlbp4jxorlx4x0eqe",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1qbzed7ex0ulx4wuzb6",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "mbutp4km4elx4wv6eq",
          "iri": "14f2be0dd1b134"
        }
      ]
    },
    "9szeezpophlx4x0jlj": {
      "id": "9szeezpophlx4x0jlj",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1qbzed7ex0ulx4wuzb6",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "vuyjc4u189lx4wv1z9",
          "iri": "b2cb9a3a5b0286"
        }
      ]
    },
    "cwqwtzcaouflx4x0msu": {
      "id": "cwqwtzcaouflx4x0msu",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "y1r4gw5kvmnlx4wv9vf",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1hxrzx2indvlx4wvcae",
          "iri": "dd1a9a7f12f5da"
        }
      ]
    },
    "yxx6nkpykblx4x0wd1": {
      "id": "yxx6nkpykblx4x0wd1",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "kfkq6pzv59glx4wv8l8",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "1hxrzx2indvlx4wvcae",
          "iri": "e381b48f584023"
        }
      ]
    },
    "jvb0bqirqgdlx4x14f1": {
      "id": "jvb0bqirqgdlx4x14f1",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "j7xhjbcb3zqlx4wvh8z",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "rpwh80760ialx4wvaxo",
          "iri": "2d62b13d7054db"
        }
      ]
    },
    "2i6oht2dde4lx4x1cb8": {
      "id": "2i6oht2dde4lx4x1cb8",
      "iri": "testy-business",
      "type": [
        "class"
      ],
      "name": {
        "en": "Testy Business"
      },
      "description": {}
    },
    "1g2lvknuc2ilx4x1glt": {
      "id": "1g2lvknuc2ilx4x1glt",
      "type": [
        "relationship"
      ],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "7jsefe4r2nlx4wv3fn",
          "iri": null
        },
        {
          "name": {},
          "description": {},
          "cardinality": null,
          "concept": "2i6oht2dde4lx4x1cb8",
          "iri": "aa9703ca798db1"
        }
      ]
    }
  };



  type ConfigAndResult = {
    config: UserGivenConstraintsVersion2,
    result: VisualEntities
  }

  const layered: ConfigAndResult = {
    config: {
        "main": {
          "layout_alg": "elk_layered",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": true,
          "constraintedNodes": "ALL"
        },
        "general": {
          "layout_alg": "elk_layered",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": false,
          "constraintedNodes": "GENERALIZATION",
          "double_run": true
        }
      },
    result: {
        "1qbzed7ex0ulx4wuzb6": {
          "id": "qkg167c9wmp",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1qbzed7ex0ulx4wuzb6",
          "visible": true,
          "position": {
            "x": 706.1810344827582,
            "y": 169
          },
          "hiddenAttributes": []
        },
        "0a1bwjw3tradlx4wv0sh": {
          "id": "g4ebz8bvrrf",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "0a1bwjw3tradlx4wv0sh",
          "visible": true,
          "position": {
            "x": 970.5129310344826,
            "y": -169
          },
          "hiddenAttributes": []
        },
        "vuyjc4u189lx4wv1z9": {
          "id": "99ejsueeprb",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "vuyjc4u189lx4wv1z9",
          "visible": true,
          "position": {
            "x": 3063.98275862069,
            "y": -169
          },
          "hiddenAttributes": []
        },
        "7jsefe4r2nlx4wv3fn": {
          "id": "baac0irsp6t",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "7jsefe4r2nlx4wv3fn",
          "visible": true,
          "position": {
            "x": 2379.1594827586205,
            "y": -169
          },
          "hiddenAttributes": []
        },
        "wbkqiz6jr2lx4wv57v": {
          "id": "rrnvza5g25p",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "wbkqiz6jr2lx4wv57v",
          "visible": true,
          "position": {
            "x": 1805.6120689655168,
            "y": 169
          },
          "hiddenAttributes": []
        },
        "mbutp4km4elx4wv6eq": {
          "id": "nu8eqh5d7pg",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "mbutp4km4elx4wv6eq",
          "visible": true,
          "position": {
            "x": 0,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "oimo8cnbqwslx4wv7q8": {
          "id": "lyxt8ngtftk",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "oimo8cnbqwslx4wv7q8",
          "visible": true,
          "position": {
            "x": 565.1896551724136,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "kfkq6pzv59glx4wv8l8": {
          "id": "hbaftgfd1yh",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "kfkq6pzv59glx4wv8l8",
          "visible": true,
          "position": {
            "x": 273.93103448275815,
            "y": 338
          },
          "hiddenAttributes": []
        },
        "y1r4gw5kvmnlx4wv9vf": {
          "id": "a6mxc71xun",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "y1r4gw5kvmnlx4wv9vf",
          "visible": true,
          "position": {
            "x": 2803.6724137931033,
            "y": 676
          },
          "hiddenAttributes": []
        },
        "rpwh80760ialx4wvaxo": {
          "id": "i4ywimnlsra",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "rpwh80760ialx4wvaxo",
          "visible": true,
          "position": {
            "x": 2372.969827586207,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "1hxrzx2indvlx4wvcae": {
          "id": "53iw4f38y8p",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1hxrzx2indvlx4wvcae",
          "visible": true,
          "position": {
            "x": 2489.814655172414,
            "y": 169
          },
          "hiddenAttributes": []
        },
        "r4n06ifqx19lx4wvddr": {
          "id": "ei654rfjf",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "r4n06ifqx19lx4wvddr",
          "visible": true,
          "position": {
            "x": -2.4741379310349885,
            "y": 507
          },
          "hiddenAttributes": []
        },
        "lfmsdy2jg8jlx4wveir": {
          "id": "j37kodyvn8",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "lfmsdy2jg8jlx4wveir",
          "visible": true,
          "position": {
            "x": 1542.512931034483,
            "y": -338
          },
          "hiddenAttributes": []
        },
        "57pfr9zj5mtlx4wvfkf": {
          "id": "t4y8rcnhnsn",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "57pfr9zj5mtlx4wvfkf",
          "visible": true,
          "position": {
            "x": 3636.6034482758623,
            "y": 338
          },
          "hiddenAttributes": []
        },
        "j7xhjbcb3zqlx4wvh8z": {
          "id": "la5colgkc5",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "j7xhjbcb3zqlx4wvh8z",
          "visible": true,
          "position": {
            "x": 2760.0301724137935,
            "y": 507
          },
          "hiddenAttributes": []
        },
        "os2060nmi18lx4wvi86": {
          "id": "4t2uvx3dprp",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "os2060nmi18lx4wvi86",
          "visible": true,
          "position": {
            "x": 3639.0775862068967,
            "y": -338
          },
          "hiddenAttributes": []
        },
        "2i6oht2dde4lx4x1cb8": {
          "id": "gyy41dog7sa",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "2i6oht2dde4lx4x1cb8",
          "visible": true,
          "position": {
            "x": 3073.8879310344837,
            "y": -338
          },
          "hiddenAttributes": []
        }
      },
  };

  const elkForce: ConfigAndResult = {
    config: {
        "main": {
          "layout_alg": "elk_force",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": true,
          "constraintedNodes": "ALL"
        },
        "general": {
          "layout_alg": "elk_layered",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": false,
          "constraintedNodes": "GENERALIZATION",
          "double_run": true
        }
      },
    result: {
        "1qbzed7ex0ulx4wuzb6": {
          "id": "zhibmnvwnj",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1qbzed7ex0ulx4wuzb6",
          "visible": true,
          "position": {
            "x": 257.2478291002524,
            "y": 787.9680657505819
          },
          "hiddenAttributes": []
        },
        "0a1bwjw3tradlx4wv0sh": {
          "id": "xy8q9ubgkwr",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "0a1bwjw3tradlx4wv0sh",
          "visible": true,
          "position": {
            "x": 60.4783102631327,
            "y": 1616.8413161982944
          },
          "hiddenAttributes": []
        },
        "vuyjc4u189lx4wv1z9": {
          "id": "a80omc7qzmd",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "vuyjc4u189lx4wv1z9",
          "visible": true,
          "position": {
            "x": 1378.469490941031,
            "y": 788.5807353286341
          },
          "hiddenAttributes": []
        },
        "7jsefe4r2nlx4wv3fn": {
          "id": "weu5e3n01nh",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "7jsefe4r2nlx4wv3fn",
          "visible": true,
          "position": {
            "x": 1735.7156833579816,
            "y": -1089.9700834505265
          },
          "hiddenAttributes": []
        },
        "wbkqiz6jr2lx4wv57v": {
          "id": "hqpei2itqir",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "wbkqiz6jr2lx4wv57v",
          "visible": true,
          "position": {
            "x": 968.6136688266914,
            "y": -454.9201362135293
          },
          "hiddenAttributes": []
        },
        "mbutp4km4elx4wv6eq": {
          "id": "mq8a27xb44",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "mbutp4km4elx4wv6eq",
          "visible": true,
          "position": {
            "x": 0,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "oimo8cnbqwslx4wv7q8": {
          "id": "bf66heroegn",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "oimo8cnbqwslx4wv7q8",
          "visible": true,
          "position": {
            "x": -581.4709757064185,
            "y": 1211.6015001662859
          },
          "hiddenAttributes": []
        },
        "kfkq6pzv59glx4wv8l8": {
          "id": "puznwhmkkf",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "kfkq6pzv59glx4wv8l8",
          "visible": true,
          "position": {
            "x": 803.12616909014,
            "y": 157.43973337124498
          },
          "hiddenAttributes": []
        },
        "y1r4gw5kvmnlx4wv9vf": {
          "id": "l7fdbl6sb1",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "y1r4gw5kvmnlx4wv9vf",
          "visible": true,
          "position": {
            "x": 2260.7415842637283,
            "y": 1105.2571441819991
          },
          "hiddenAttributes": []
        },
        "rpwh80760ialx4wvaxo": {
          "id": "lpv1rsvaw8d",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "rpwh80760ialx4wvaxo",
          "visible": true,
          "position": {
            "x": 2111.125907505121,
            "y": -70.82872016221063
          },
          "hiddenAttributes": []
        },
        "1hxrzx2indvlx4wvcae": {
          "id": "14y16b4j11r",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1hxrzx2indvlx4wvcae",
          "visible": true,
          "position": {
            "x": 1805.1519898111778,
            "y": 791.330072039726
          },
          "hiddenAttributes": []
        },
        "r4n06ifqx19lx4wvddr": {
          "id": "xkoex998rks",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "r4n06ifqx19lx4wvddr",
          "visible": true,
          "position": {
            "x": 21.519278428572306,
            "y": -819.5814151986319
          },
          "hiddenAttributes": []
        },
        "lfmsdy2jg8jlx4wveir": {
          "id": "j2z4eqeq8gs",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "lfmsdy2jg8jlx4wveir",
          "visible": true,
          "position": {
            "x": 842.9336410746115,
            "y": 825.1158377984902
          },
          "hiddenAttributes": []
        },
        "57pfr9zj5mtlx4wvfkf": {
          "id": "y6l9kmm0f4r",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "57pfr9zj5mtlx4wvfkf",
          "visible": true,
          "position": {
            "x": 3086.2742205219674,
            "y": 1495.4515157176734
          },
          "hiddenAttributes": []
        },
        "j7xhjbcb3zqlx4wvh8z": {
          "id": "lyw4zniafb",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "j7xhjbcb3zqlx4wvh8z",
          "visible": true,
          "position": {
            "x": 1710.6420664369602,
            "y": 294.2851948340108
          },
          "hiddenAttributes": []
        },
        "os2060nmi18lx4wvi86": {
          "id": "ua43ptxvvi",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "os2060nmi18lx4wvi86",
          "visible": true,
          "position": {
            "x": 2727.270794891264,
            "y": 763.6785300801362
          },
          "hiddenAttributes": []
        },
        "2i6oht2dde4lx4x1cb8": {
          "id": "5i4b6nks7ux",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "2i6oht2dde4lx4x1cb8",
          "visible": true,
          "position": {
            "x": 2178.1612278669218,
            "y": -2088.161574562456
          },
          "hiddenAttributes": []
        }
      },
  };

  const elkStress: ConfigAndResult = {
    config: {
        "main": {
          "layout_alg": "elk_stress",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": true,
          "constraintedNodes": "ALL"
        },
        "general": {
          "layout_alg": "elk_layered",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": false,
          "constraintedNodes": "GENERALIZATION",
          "double_run": true
        }
      },
    result: {
        "1qbzed7ex0ulx4wuzb6": {
          "id": "srafx0oqqid",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1qbzed7ex0ulx4wuzb6",
          "visible": true,
          "position": {
            "x": 682.190368822162,
            "y": 31.312593225137334
          },
          "hiddenAttributes": []
        },
        "0a1bwjw3tradlx4wv0sh": {
          "id": "bi4h7q9ntx6",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "0a1bwjw3tradlx4wv0sh",
          "visible": true,
          "position": {
            "x": 287.48443946398027,
            "y": 451.93728966122853
          },
          "hiddenAttributes": []
        },
        "vuyjc4u189lx4wv1z9": {
          "id": "js5haasvj1r",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "vuyjc4u189lx4wv1z9",
          "visible": true,
          "position": {
            "x": 1133.7526929506473,
            "y": -551.7054389396292
          },
          "hiddenAttributes": []
        },
        "7jsefe4r2nlx4wv3fn": {
          "id": "urlguudml0r",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "7jsefe4r2nlx4wv3fn",
          "visible": true,
          "position": {
            "x": 2270.6565102711447,
            "y": 345.29121517966587
          },
          "hiddenAttributes": []
        },
        "wbkqiz6jr2lx4wv57v": {
          "id": "3tux0ig9qfv",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "wbkqiz6jr2lx4wv57v",
          "visible": true,
          "position": {
            "x": 1652.8847573507321,
            "y": 703.86159938645
          },
          "hiddenAttributes": []
        },
        "mbutp4km4elx4wv6eq": {
          "id": "0x4l60g8v84",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "mbutp4km4elx4wv6eq",
          "visible": true,
          "position": {
            "x": 967.9230092261065,
            "y": 753.2167255604932
          },
          "hiddenAttributes": []
        },
        "oimo8cnbqwslx4wv7q8": {
          "id": "eifyvkvi6ya",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "oimo8cnbqwslx4wv7q8",
          "visible": true,
          "position": {
            "x": 0,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "kfkq6pzv59glx4wv8l8": {
          "id": "l3xk9myb92",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "kfkq6pzv59glx4wv8l8",
          "visible": true,
          "position": {
            "x": 1350.0179714622805,
            "y": 324.7420979419355
          },
          "hiddenAttributes": []
        },
        "y1r4gw5kvmnlx4wv9vf": {
          "id": "372t6jr49d7",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "y1r4gw5kvmnlx4wv9vf",
          "visible": true,
          "position": {
            "x": 1164.5833010242786,
            "y": -921.8815965109657
          },
          "hiddenAttributes": []
        },
        "rpwh80760ialx4wvaxo": {
          "id": "q3y9oyavc0f",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "rpwh80760ialx4wvaxo",
          "visible": true,
          "position": {
            "x": 1982.1129036171583,
            "y": -275.02673956467765
          },
          "hiddenAttributes": []
        },
        "1hxrzx2indvlx4wvcae": {
          "id": "akamt0sjtsp",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1hxrzx2indvlx4wvcae",
          "visible": true,
          "position": {
            "x": 1343.831829920226,
            "y": -197.39868972327213
          },
          "hiddenAttributes": []
        },
        "r4n06ifqx19lx4wvddr": {
          "id": "9cqd1ed3cko",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "r4n06ifqx19lx4wvddr",
          "visible": true,
          "position": {
            "x": 1456.83542806694,
            "y": 1143.225222713982
          },
          "hiddenAttributes": []
        },
        "lfmsdy2jg8jlx4wveir": {
          "id": "vqlh42p8lvn",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "lfmsdy2jg8jlx4wveir",
          "visible": true,
          "position": {
            "x": 965.1948350728893,
            "y": 387.3603973050135
          },
          "hiddenAttributes": []
        },
        "57pfr9zj5mtlx4wvfkf": {
          "id": "qcwhqnht38q",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "57pfr9zj5mtlx4wvfkf",
          "visible": true,
          "position": {
            "x": 943.8595884683425,
            "y": -1554.7466751266402
          },
          "hiddenAttributes": []
        },
        "j7xhjbcb3zqlx4wvh8z": {
          "id": "llmx6muth5",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "j7xhjbcb3zqlx4wvh8z",
          "visible": true,
          "position": {
            "x": 1642.015806154844,
            "y": -426.91572893989087
          },
          "hiddenAttributes": []
        },
        "os2060nmi18lx4wvi86": {
          "id": "bq287fp9eik",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "os2060nmi18lx4wvi86",
          "visible": true,
          "position": {
            "x": 1409.7138960291138,
            "y": -1266.5879976506283
          },
          "hiddenAttributes": []
        },
        "2i6oht2dde4lx4x1cb8": {
          "id": "1twuciukc87",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "2i6oht2dde4lx4x1cb8",
          "visible": true,
          "position": {
            "x": 2883.869815132751,
            "y": 518.0468017737685
          },
          "hiddenAttributes": []
        }
      },
  };

  // Up and Right
  const layeredWithLayeredGeneralization: ConfigAndResult = {
    config: {
        "main": {
          "layout_alg": "elk_layered",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": true,
          "constraintedNodes": "ALL"
        },
        "general": {
          "layout_alg": "elk_layered",
          "alg_direction": DIRECTION["RIGHT"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": true,
          "constraintedNodes": "GENERALIZATION",
          "double_run": true
        }
      },
    result: {
        "1qbzed7ex0ulx4wuzb6": {
          "id": "q5rqwk014ta",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1qbzed7ex0ulx4wuzb6",
          "visible": true,
          "position": {
            "x": 324.0689655172413,
            "y": 507
          },
          "hiddenAttributes": []
        },
        "0a1bwjw3tradlx4wv0sh": {
          "id": "rkyg9vzp6gp",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "0a1bwjw3tradlx4wv0sh",
          "visible": true,
          "position": {
            "x": 861.4051724137931,
            "y": 169
          },
          "hiddenAttributes": []
        },
        "vuyjc4u189lx4wv1z9": {
          "id": "md7rr8buy4a",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "vuyjc4u189lx4wv1z9",
          "visible": true,
          "position": {
            "x": 2278.7155172413795,
            "y": 169
          },
          "hiddenAttributes": []
        },
        "7jsefe4r2nlx4wv3fn": {
          "id": "eezlekqtyn5",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "7jsefe4r2nlx4wv3fn",
          "visible": true,
          "position": {
            "x": 1716.620689655172,
            "y": 169
          },
          "hiddenAttributes": []
        },
        "wbkqiz6jr2lx4wv57v": {
          "id": "0v8qkjohqtth",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "wbkqiz6jr2lx4wv57v",
          "visible": true,
          "position": {
            "x": 858.3103448275862,
            "y": 507
          },
          "hiddenAttributes": []
        },
        "mbutp4km4elx4wv6eq": {
          "id": "kgh63jorz0n",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "mbutp4km4elx4wv6eq",
          "visible": true,
          "position": {
            "x": 26,
            "y": 338
          },
          "hiddenAttributes": []
        },
        "oimo8cnbqwslx4wv7q8": {
          "id": "1ichtaeidkx",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "oimo8cnbqwslx4wv7q8",
          "visible": true,
          "position": {
            "x": 591.1896551724136,
            "y": 338
          },
          "hiddenAttributes": []
        },
        "kfkq6pzv59glx4wv8l8": {
          "id": "k90sco9zvxd",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "kfkq6pzv59glx4wv8l8",
          "visible": true,
          "position": {
            "x": -244.2155172413793,
            "y": 676
          },
          "hiddenAttributes": []
        },
        "y1r4gw5kvmnlx4wv9vf": {
          "id": "mpul3ietxq",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "y1r4gw5kvmnlx4wv9vf",
          "visible": true,
          "position": {
            "x": 2556.362068965517,
            "y": 1014
          },
          "hiddenAttributes": []
        },
        "rpwh80760ialx4wvaxo": {
          "id": "ook6yl50enj",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "rpwh80760ialx4wvaxo",
          "visible": true,
          "position": {
            "x": 1440.215517241379,
            "y": 338
          },
          "hiddenAttributes": []
        },
        "1hxrzx2indvlx4wvcae": {
          "id": "6brip5f1dhv",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1hxrzx2indvlx4wvcae",
          "visible": true,
          "position": {
            "x": 1429.9310344827586,
            "y": 507
          },
          "hiddenAttributes": []
        },
        "r4n06ifqx19lx4wvddr": {
          "id": "96p20ip1d5",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "r4n06ifqx19lx4wvddr",
          "visible": true,
          "position": {
            "x": -520.6206896551724,
            "y": 845
          },
          "hiddenAttributes": []
        },
        "lfmsdy2jg8jlx4wveir": {
          "id": "qgurtveauj",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "lfmsdy2jg8jlx4wveir",
          "visible": true,
          "position": {
            "x": 0,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "57pfr9zj5mtlx4wvfkf": {
          "id": "clu1cce4958",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "57pfr9zj5mtlx4wvfkf",
          "visible": true,
          "position": {
            "x": 2283.051724137931,
            "y": 676
          },
          "hiddenAttributes": []
        },
        "j7xhjbcb3zqlx4wvh8z": {
          "id": "rc450s7t1t",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "j7xhjbcb3zqlx4wvh8z",
          "visible": true,
          "position": {
            "x": 2283.051724137931,
            "y": 845
          },
          "hiddenAttributes": []
        },
        "os2060nmi18lx4wvi86": {
          "id": "ys0c7f5e2vf",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "os2060nmi18lx4wvi86",
          "visible": true,
          "position": {
            "x": 2552.0258620689656,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "2i6oht2dde4lx4x1cb8": {
          "id": "mqmgfh3kiq",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "2i6oht2dde4lx4x1cb8",
          "visible": true,
          "position": {
            "x": 1986.8362068965516,
            "y": 0
          },
          "hiddenAttributes": []
        }
      },
  };

  const elkStressWithLayeredGeneralization: ConfigAndResult = {
    config: {
        "main": {
          "layout_alg": "elk_stress",
          "alg_direction": DIRECTION["UP"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": true,
          "constraintedNodes": "ALL"
        },
        "general": {
          "layout_alg": "elk_layered",
          "alg_direction": DIRECTION["RIGHT"],
          "layer_gap": 100,
          "in_layer_gap": 100,
          "stress_edge_len": 600,
          "force_alg_type": "FRUCHTERMAN_REINGOLD",
          "min_distance_between_nodes": 100,
          "should_be_considered": true,
          "constraintedNodes": "GENERALIZATION",
          "double_run": true
        }
      },
    result: {
        "1qbzed7ex0ulx4wuzb6": {
          "id": "45t7r3nkntu",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1qbzed7ex0ulx4wuzb6",
          "visible": true,
          "position": {
            "x": 682.190368822162,
            "y": 31.312593225137334
          },
          "hiddenAttributes": []
        },
        "0a1bwjw3tradlx4wv0sh": {
          "id": "lrpw6y25sng",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "0a1bwjw3tradlx4wv0sh",
          "visible": true,
          "position": {
            "x": 287.48443946398027,
            "y": 451.93728966122853
          },
          "hiddenAttributes": []
        },
        "vuyjc4u189lx4wv1z9": {
          "id": "cxq5wgw9sgs",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "vuyjc4u189lx4wv1z9",
          "visible": true,
          "position": {
            "x": 1133.7526929506473,
            "y": -551.7054389396292
          },
          "hiddenAttributes": []
        },
        "7jsefe4r2nlx4wv3fn": {
          "id": "oh4yxeqcpuc",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "7jsefe4r2nlx4wv3fn",
          "visible": true,
          "position": {
            "x": 2270.6565102711447,
            "y": 345.29121517966587
          },
          "hiddenAttributes": []
        },
        "wbkqiz6jr2lx4wv57v": {
          "id": "qsngoigt7tl",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "wbkqiz6jr2lx4wv57v",
          "visible": true,
          "position": {
            "x": 1652.8847573507321,
            "y": 703.86159938645
          },
          "hiddenAttributes": []
        },
        "mbutp4km4elx4wv6eq": {
          "id": "cc9lxurxxf5",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "mbutp4km4elx4wv6eq",
          "visible": true,
          "position": {
            "x": 967.9230092261065,
            "y": 753.2167255604932
          },
          "hiddenAttributes": []
        },
        "oimo8cnbqwslx4wv7q8": {
          "id": "k3jkzrzirzp",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "oimo8cnbqwslx4wv7q8",
          "visible": true,
          "position": {
            "x": 0,
            "y": 0
          },
          "hiddenAttributes": []
        },
        "kfkq6pzv59glx4wv8l8": {
          "id": "vzvwowcftl",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "kfkq6pzv59glx4wv8l8",
          "visible": true,
          "position": {
            "x": 1350.0179714622805,
            "y": 324.7420979419355
          },
          "hiddenAttributes": []
        },
        "y1r4gw5kvmnlx4wv9vf": {
          "id": "5zt0ip64w6m",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "y1r4gw5kvmnlx4wv9vf",
          "visible": true,
          "position": {
            "x": 1164.5833010242786,
            "y": -921.8815965109657
          },
          "hiddenAttributes": []
        },
        "rpwh80760ialx4wvaxo": {
          "id": "0eajdqqpvaav",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "rpwh80760ialx4wvaxo",
          "visible": true,
          "position": {
            "x": 1982.1129036171583,
            "y": -275.02673956467765
          },
          "hiddenAttributes": []
        },
        "1hxrzx2indvlx4wvcae": {
          "id": "oeb1t6on4vl",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "1hxrzx2indvlx4wvcae",
          "visible": true,
          "position": {
            "x": 1343.831829920226,
            "y": -197.39868972327213
          },
          "hiddenAttributes": []
        },
        "r4n06ifqx19lx4wvddr": {
          "id": "3j7hbkwyqxw",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "r4n06ifqx19lx4wvddr",
          "visible": true,
          "position": {
            "x": 1456.83542806694,
            "y": 1143.225222713982
          },
          "hiddenAttributes": []
        },
        "lfmsdy2jg8jlx4wveir": {
          "id": "pzgwi3qv3ke",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "lfmsdy2jg8jlx4wveir",
          "visible": true,
          "position": {
            "x": 965.1948350728893,
            "y": 387.3603973050135
          },
          "hiddenAttributes": []
        },
        "57pfr9zj5mtlx4wvfkf": {
          "id": "ijms5ah24el",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "57pfr9zj5mtlx4wvfkf",
          "visible": true,
          "position": {
            "x": 943.8595884683425,
            "y": -1554.7466751266402
          },
          "hiddenAttributes": []
        },
        "j7xhjbcb3zqlx4wvh8z": {
          "id": "a8owlbvfkk",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "j7xhjbcb3zqlx4wvh8z",
          "visible": true,
          "position": {
            "x": 1642.015806154844,
            "y": -426.91572893989087
          },
          "hiddenAttributes": []
        },
        "os2060nmi18lx4wvi86": {
          "id": "0wglqs37m6ls",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "os2060nmi18lx4wvi86",
          "visible": true,
          "position": {
            "x": 1409.7138960291138,
            "y": -1266.5879976506283
          },
          "hiddenAttributes": []
        },
        "2i6oht2dde4lx4x1cb8": {
          "id": "jy6v49pt6fk",
          "type": [
            "visual-entity"
          ],
          "sourceEntityId": "2i6oht2dde4lx4x1cb8",
          "visible": true,
          "position": {
            "x": 2883.869815132751,
            "y": 518.0468017737685
          },
          "hiddenAttributes": []
        }
      },
  };




  const configs: Record<string, ConfigAndResult> = {
    "layered": layered,
    // "elk-force": elkForce,
    "elk-stress": elkStress,
    "layered-layeredGeneralization": layeredWithLayeredGeneralization,
    "elk-stress-layeredGeneralization": elkStressWithLayeredGeneralization,
  };