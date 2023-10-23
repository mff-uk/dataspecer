import * as Support from "./testSupport";
import{ JSONSchemaFaker } from "json-schema-faker";
import ParserJsonld from '@rdfjs/parser-jsonld';
import { Readable } from 'stream';
import { DataFactory, Sink, Stream, BaseQuad, Quad } from 'rdf-js';

/*
const jsf = require("json-schema-faker");
const fs = require("fs");
const path = require("path");

const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/schema.json"), "utf8")
);
const dataPath = path.join(__dirname, "../data/generated_data.json");

// Extend the base functionality
jsf.extend("faker", () => require("faker"));
jsf.extend("cuid", () => {
  const cuid = require("cuid");

  const res = {
    cuid: () => cuid(),
  };
  return res;
});

const data = {};

async function main() {
  let currentData;
  if (fs.existsSync(dataPath)) {
    currentData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  }

  const entries = Object.entries(schema.definitions);

  for (const [key, value] of entries) {
    if (currentData && currentData[key]) {
      console.log("Using existing data for", key);
      data[key] = currentData[key];
      continue;
    }

    const injected = {
        ...(typeof value === 'object' ? value : {}) ,
      definitions: schema.definitions,
    };

    // use the async-version (preferred way)
    const sample = await jsf.resolve(injected);
    data[key] = sample;
  }

  const outputJson = JSON.stringify(data, null, 2);
  fs.writeFileSync(dataPath, outputJson);
}
*/
const reffedSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Věc",
  "type": "object",
  "required": [
    "id",
    "type",
    "název"
  ],
  "properties": {
    "id": {
      "type": "string",
      "format": "iri"
    },
    "type": {
      "oneOf": [
        {
          "const": "Věc"
        },
        {
          "type": "array",
          "contains": {
            "const": "Věc"
          },
          "items": {
            "type": "string"
          }
        }
      ]
    },
    "název": {
      "title": "název",
      "type": "object",
      "required": [

      ],
      "properties": {
        "cs": {
          "title": "Hodnota v českém jazyce",
          "type": "string"
        },
        "en": {
          "title": "Hodnota v anglickém jazyce",
          "type": "string"
        }
      }
    },
    "popis": {
      "title": "popis",
      "type": "object",
      "required": [

      ],
      "properties": {
        "cs": {
          "title": "Hodnota v českém jazyce",
          "type": "string"
        },
        "en": {
          "title": "Hodnota v anglickém jazyce",
          "type": "string"
        }
      }
    },
    "příloha": {
      "title": "má přílohu",
      "type": "array",
      "items": {
        "title": "Digitální objekt",
        "description": "Digitální objekt je objekt existující pouze v digitálním světě (např. databáze nebo datová sada) příp. se jedná o plně digitalizovaný objekt reálného světa (např. dokument, obrázek nebo kniha).",
        "type": "object",
        "required": [
          "id",
          "type",
          "url",
          "správce_osobních_údajů",
          "typ_média",
          "má_podmínky_užití"
        ],
        "properties": {
          "id": {
            "type": "string",
            "format": "iri"
          },
          "type": {
            "oneOf": [
              {
                "const": "Digitální objekt"
              },
              {
                "type": "array",
                "contains": {
                  "const": "Digitální objekt"
                },
                "items": {
                  "type": "string"
                }
              }
            ]
          },
          "url": {
            "title": "url ke stažení",
            "type": "string",
            "format": "iri"
          },
          "poskytovatele": {
            "title": "má poskytovatele",
            "description": "K digitálnímu objektu přiřazuje jeho poskytovatele.",
            "type": "string",
            "format": "iri"
          },
          "kurátor": {
            "title": "má kurátora",
            "description": "K digitálnímu objektu přiřazuje jeho kurátora.",
            "type": "string",
            "format": "iri"
          },
          "autor_díla": {
            "title": "má autora díla",
            "description": "K digitálnímu dílu přiřazuje jeho autora.",
            "type": "string",
            "format": "iri"
          },
          "vykonavatel_autorské_dílo": {
            "title": "má vykonavatele majetkových práv autorských u autorského díla",
            "description": "Přiřazuje k digitálnímu objektu vykonavatele majetkových práv autorských.",
            "type": "string",
            "format": "iri"
          },
          "autor_originální_databáze": {
            "title": "má autora originální databáze",
            "description": "K digitálnímu objektu, který je originální databází, přiřazuje jejího autora.",
            "type": "string",
            "format": "iri"
          },
          "vykonavatel_originální_databáze": {
            "title": "má vykonavatele majetkových práv autorských u originální databáze",
            "description": "Vykonavatele majetkových práv autorských daného digitálního objektu, který je originální databází. Typicky se bude jednat o zaměstnavatele autora (§ 58 zákona č. 121/2000 Sb, autorský zákon).",
            "type": "string",
            "format": "iri"
          },
          "pořizovatel_databáze": {
            "title": "má pořizovatele databáze",
            "description": "K digitálnímu objektu, který je databází, přiřazuje pořizovatele  dané databáze.",
            "type": "string",
            "format": "iri"
          },
          "správce_osobních_údajů": {
            "title": "má správce osobních údajů",
            "description": "K digitálnímu objektu přiřazuje správce osobních údajů.",
            "type": "string",
            "format": "iri"
          },
          "zpracovatel_osobních_údajů": {
            "title": "má zpracovatele osobních údajů",
            "description": "Přiřazuje k digitálnímu dílu zpracovatele osobních údajů.",
            "type": "string",
            "format": "iri"
          },
          "typ_média": {
            "title": "má typ média",
            "description": "Určuje, o jaký typ digitálního objektu se jedná ve smyslu typu digitálního média a jeho konkrétního formátu (např. datový soubor, obrázek, video, audio, apod.).",
            "type": "string",
            "format": "iri"
          },
          "má_podmínky_užití": {
            "title": "má podmínky užití",
            "description": "Specifikace podmínek užití digitálního objektu.",
            "type": "object",
            "required": [
              "id",
              "type"
            ],
            "properties": {
              "id": {
                "type": "string",
                "format": "iri"
              },
              "type": {
                "oneOf": [
                  {
                    "const": "Podmínky užití"
                  },
                  {
                    "type": "array",
                    "contains": {
                      "const": "Podmínky užití"
                    },
                    "items": {
                      "type": "string"
                    }
                  }
                ]
              },
              "obsahuje_autorské_dílo": {
                "title": "obsahuje autorské dílo",
                "description": "Vyjádření, zda daný digitální objekt je či není autorským dílem, které není originální databází.",
                "type": "boolean"
              },
              "obsahuje_více_autorských_děl": {
                "title": "obsahuje více autorských děl",
                "description": "Vyjádření, že daný digitální objekt obsahuje více autorských děl, která nejsou originální databází. V takovém případě se má za to, že podmínky užití jednotlivých děl jsou upraveny uvnitř digitálního objektu.",
                "type": "boolean"
              },
              "licence_autorského_díla": {
                "title": "licence autorského díla",
                "description": "Licence autorského díla, které není originální databází. Při nastavení podmínek užití doporučujeme řídit se dle doporučení pro Stanovení podmínek užití otevřených dat. Lze využít i vlastní licenci, která musí být uvedena odkazem na tuto licenci. Tato praxe je ale výrazně nedoporučována s ohledem na zajištění interoperability digitálních objektů.",
                "type": "string",
                "format": "iri"
              },
              "originální_databáze": {
                "title": "originální databáze",
                "description": "Vyjádření, zda daný digitální objekt je či není originální (autorskoprávně chráněnou) databází.",
                "type": "boolean"
              },
              "licence_originální_databáze": {
                "title": "licence originální databáze",
                "description": "Licence originální databáze. Při nastavení podmínek užití doporučujeme řídit se dle doporučení pro Stanovení podmínek užití otevřených dat. Lze využít i vlastní licenci, která musí být uvedena odkazem na tuto licenci. Tato praxe je ale výrazně nedoporučována s ohledem na zajištění interoperability digitálních objektů.",
                "type": "string",
                "format": "iri"
              },
              "ochrana_zvláštními_právy_pořizovatele_databáze": {
                "title": "databáze chráněná zvláštními právy pořizovatele databáze",
                "description": "Vyjádření, zda daný digitální objekt je či není chráněn zvláštními právy pořizovatele databáze.",
                "type": "boolean"
              },
              "licence_databáze_chráněné_zvláštními_právy_pořizovatele_databáze": {
                "title": "licence pro databázi chráněnou zvláštními právy pořizovatele databáze",
                "description": "Licence pro databázi chráněnou zvláštními právy pořizovatele databáze. Při nastavení podmínek užití doporučujeme řídit se dle doporučení pro Stanovení podmínek užití otevřených dat. Lze využít i vlastní licenci, která musí být uvedena odkazem na tuto licenci. Tato praxe je ale výrazně nedoporučována s ohledem na zajištění interoperability digitálních objektů.",
                "type": "string",
                "format": "iri"
              },
              "obsahuje_osobní_údaje": {
                "title": "obsahuje osobní údaje",
                "description": "Vyjádření, zda daný digitální objekt obsahuje či neobsahuje osobní údaje.",
                "type": "boolean"
              }
            }
          }
        }
      }
    }
  }
}`;
/*
const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Věc",
    type: "object",
    required: [
      "id",
      "type",
      "název",
      "popis"
    ],
    properties: {
      id: {
        type: "string",
        format: "iri"
      },
      type: {
        oneOf: [
          {
            const: "Věc"
          },
          {
            type: "array",
            contains: {
              const: "Věc"
            },
            items: {
              type: "string"
            }
          }
        ]
      },
      název: {
        title: "název",
        type: "object",
        required: [
  
        ],
        properties: {
          cs: {
            title: "Hodnota v českém jazyce",
            type: "string"
          },
          en: {
            title: "Hodnota v anglickém jazyce",
            type: "string"
          }
        }
      },
      popis: {
        title: "popis",
        type: "object",
        required: [
  
        ],
        properties: {
          cs: {
            title: "Hodnota v českém jazyce",
            type: "string"
          },
          en: {
            title: "Hodnota v anglickém jazyce",
            type: "string"
          }
        }
      }
    }
  }
;
*/
const contextPart = `{
  "@context": {
    "@version": 1.1,
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "id": "@id",
    "type": "@type",
    "Věc": {
      "@id": "https://slovník.gov.cz/generický/věci/pojem/věc",
      "@context": {
        "název": {
          "@id": "https://slovník.gov.cz/generický/věci/pojem/název",
          "@container": "@language"
        },
        "popis": {
          "@id": "https://slovník.gov.cz/generický/věci/pojem/popis",
          "@container": "@language"
        },
        "příloha": {
          "@id": "https://slovník.gov.cz/generický/věci/pojem/má-přílohu",
          "@container": "@set",
          "@context": {
            "Digitální objekt": {
              "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/digitální-objekt",
              "@context": {
                "url": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/url-ke-stažení",
                  "@type": "xsd:anyURI"
                },
                "poskytovatele": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-poskytovatele",
                  "@type": "@id"
                },
                "kurátor": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-kurátora",
                  "@type": "@id"
                },
                "autor_díla": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-autora-díla",
                  "@type": "@id"
                },
                "vykonavatel_autorské_dílo": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-vykonavatele-majetkových-práv-autorských-u-autorského-díla",
                  "@type": "@id"
                },
                "autor_originální_databáze": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-autora-originální-databáze",
                  "@type": "@id"
                },
                "vykonavatel_originální_databáze": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-vykonavatele-majetkových-práv-autorských-u-originální-databáze",
                  "@type": "@id"
                },
                "pořizovatel_databáze": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-pořizovatele-databáze",
                  "@type": "@id"
                },
                "správce_osobních_údajů": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-správce-osobních-údajů",
                  "@type": "@id"
                },
                "zpracovatel_osobních_údajů": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-zpracovatele-osobních-údajů",
                  "@type": "@id"
                },
                "typ_média": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-typ-média",
                "má_podmínky_užití": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-podmínky-užití",
                  "@type": "@id",
                  "@context": {
                    "Podmínky užití": {
                      "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/podmínky-užití",
                      "@context": {
                        "obsahuje_autorské_dílo": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/obsahuje-autorské-dílo",
                          "@type": "xsd:boolean"
                        },
                        "obsahuje_více_autorských_děl": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/obsahuje-více-autorských-děl",
                          "@type": "xsd:boolean"
                        },
                        "licence_autorského_díla": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/licence-autorského-díla",
                          "@type": "@id"
                        },
                        "originální_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/originální-databáze",
                          "@type": "xsd:boolean"
                        },
                        "licence_originální_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/licence-originální-databáze",
                          "@type": "@id"
                        },
                        "ochrana_zvláštními_právy_pořizovatele_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/databáze-chráněná-zvláštními-právy-pořizovatele-databáze",
                          "@type": "xsd:boolean"
                        },
                        "licence_databáze_chráněné_zvláštními_právy_pořizovatele_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/licence-pro-databázi-chráněnou-zvláštními-právy-pořizovatele-databáze",
                          "@type": "@id"
                        },
                        "obsahuje_osobní_údaje": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/obsahuje-osobní-údaje",
                          "@type": "xsd:boolean"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

  async function generate(schema : string) : Promise<String> {
    //const json = JSON.parse(schema);
    const json = JSON.parse(reffedSchema); // Sample json schema
    JSONSchemaFaker.option({alwaysFakeOptionals: true, requiredOnly: true});
    const asyncValue = await JSONSchemaFaker.resolve(json);
    
    //const contextPart = JSON.stringify(jsonContext, null, 2);
    //const dataPart = JSON.stringify(asyncValue, null, 2).slice(1);
    

    const doc = contextPart.slice(0, -1) + "," + JSON.stringify(asyncValue, null, 2).slice(1);
    const parserJsonld = new ParserJsonld();
  
    const input = new Readable({
      read: () => {
        input.push(doc);
        input.push(null);
      }
    })
  
    const output = parserJsonld.import(input);
  
    var str = "";
    /*
    output.on('data', quad => {
      console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`);
    })
  console.log("str in fake \n" + str);
  */
    /*
    output.on('data', quad => {
      console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`)
    })
*/
    return JSON.stringify(asyncValue, null, 2);
    //await console.log("Async value of generated data\n" + JSON.stringify(asyncValue, null, 2));

  }

  export default generate;