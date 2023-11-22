import{ JSONSchemaFaker } from "json-schema-faker";
import * as jsonld from 'jsonld';
import * as Support from "./testSupport";
import * as N3 from "n3";
import * as fs from "fs";

// TODO: Parsing raw Json data to Nquads changes simple decimal containing floating point to number containing exponent E, which is not a decimal number

  export async function generate(fileName : string) : Promise<String> {
    const schema = fs.readFileSync(fileName,
    { encoding: 'utf8', flag: 'r' });
    const json = JSON.parse(schema);
    JSONSchemaFaker.option({requiredOnly: true});
    const generatedJson = await JSONSchemaFaker.resolve(json);
    
    if(generatedJson == null){
      return "";
    } else {
      return JSON.stringify(generatedJson, null, 2);
    }
  }

  export async function fromRawJsonDataToNquads(rawJsonData : string, testType : string) : Promise<String> {
      const doc3 = rawJsonData;
      console.log(rawJsonData);
      const context3 = fs.readFileSync('./src/tests/data/' + testType + 'Context.json',{ encoding: 'utf8', flag: 'r' });;

      const compacted3 = context3.slice(0, -1) + "," + doc3.substr(1);

      const parsed = JSON.parse(compacted3);
      console.log(compacted3);
      console.log(parsed);
      const nquads = await jsonld.toRDF(parsed, {format: 'application/n-quads'});
      console.log(nquads);
      const written = await Support.syncWriteFile("../data/" + testType + "FakeData.ttl", nquads);

      return nquads.toString();
  }

/*  
  export async function fromJsonLdToTurtle(jsonld : string) : Promise<String> {

  }

  export async function fromQuadsToJsonld(quads : string) : Promise<String> {

  }
*/
  export async function fromJsonToTurtle(rawJsonData : string, testType : string) : Promise<void> {
    const nquadsData = fromRawJsonDataToNquads(rawJsonData, testType);
    // TODO
     //UNQUOTE ONCE DECIMAL number changing into numbers containing exponent is resolved
    // Parsing Nquads to Turtle format from one file to other
      var access = fs.createWriteStream('./src/tests/data/' + testType + 'FakeDataTurtle.ttl');
      const streamParser = new N3.StreamParser({ format: 'application/n-quads' }),
      inputStream = fs.createReadStream('./src/tests/data/' + testType + 'FakeData.ttl'), 
      streamWriter = new N3.StreamWriter();
      inputStream.pipe(streamParser);
      streamParser.pipe(streamWriter);
      streamWriter.pipe(access);
    
    // End of enriching keys
  }

  const jsonldDataExamnple = {
    "@context": {
      "@version": 1.1,
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "id": "@id",
      "type": "@type",
      "Událost": {
        "@id": "https://slovník.gov.cz/datový/události/pojem/událost",
        "@context": {
          "registrace": {
            "@id": "https://slovník.gov.cz/datový/události/pojem/registrace",
            "@type": "xsd:boolean"
          },
          "dlouhý_popis": "https://slovník.gov.cz/datový/události/pojem/dlouhý-popis",
          "název": {
            "@id": "https://slovník.gov.cz/generický/věci/pojem/název",
            "@container": "@language"
          },
          "popis": "https://slovník.gov.cz/generický/věci/pojem/popis",
          "vytvořeno": {
            "@id": "https://slovník.gov.cz/generický/věci/pojem/vytvořeno",
            "@container": "@set",
            "@type": "@id"
          },
          "relevantní_do": {
            "@id": "https://slovník.gov.cz/generický/věci/pojem/relevantní-do",
            "@container": "@set",
            "@type": "@id"
          },
          "má_umístění": {
            "@id": "https://slovník.gov.cz/datový/události/pojem/má-umístění",
            "@container": "@set",
            "@context": {
              "Lokalizace prostorového objektu": {
                "@id": "https://slovník.gov.cz/veřejný-sektor/pojem/lokalizace-prostorového-objektu",
                "@context": {
                  "má_lokalizaci": {
                    "@reverse": "https://slovník.gov.cz/veřejný-sektor/pojem/má-lokalizaci",
                    "@container": "@set",
                    "@type": "@id"
                  },
                  "má_umístění": {
                    "@reverse": "https://slovník.gov.cz/datový/události/pojem/má-umístění",
                    "@container": "@set",
                    "@type": "@id"
                  }
                }
              }
            }
          }
        }
      }
    },
  "id": "http://hCQoiUqXjDvYEMzqvXkmYIcomNSpXFUy.mgzvoJGPvLhtocYIHQJWY4K,5LGF+sp9kJuRHT4iREho95Y1Ws?qhmqzdk=e7&fpfai&",
    "type": "Událost",
    "vytvořeno": [
      "http://BhgbMoTiJazPpvnTwslHfUKwjzhkyik.xupj.FqMwd-M8U1R9bxoYPkUo,2tJwwpAvaWtz6HwGEBX8nm,JlW.k02pLUuSAquhdQ",
      "https://AsBkyeaTIjfIGdQswnSPLqRAFwvLYzeD.cpSXesSqOtbIFt180HncqJsNUi10YlsYlTIF0nRV1Z,7Esc1QaHI",
      "https://nrvOBIDXbxLG.omwpgx+5SgLh3nDoffP4M0271BW3ewHlmJO6CqZIdmchCiNBJJZuBkhWUgPF1.i0,zP9CLn?naycjt=O&xtdnct&"
    ],
    "název": {
      "en": "velit ut tempor",
      "cs": "dolor veniam"
    },
    "má_umístění": [
      {
        "id": "https://OgjWuzTuFTKFYIiiLOBYhsPlPjOwOfPE.ivmwxS57QeIq5aTAVbYYpGVvhOUfZgNuVt7qPl3zQj+LMbq2OCbFawe",
        "type": [
          "Lokalizace prostorového objektu"
        ]
      },
      {
        "id": "https://rgIeRWCGmSDa.yqtiWcgek2FkZ,4I",
        "type": "Lokalizace prostorového objektu",
        "má_lokalizaci": [
          "https://vKDKSIrhGJutTtIbcZMSJqIobSzUVDp.coUAz4RlZS,oZ,atRuFGLbKe,o3NHhiAmxQBELcKT400Fnl.6lW,+6Fg.9uoZ2u9SJT5",
          "http://oilFMPltjG.ztvhvDPQEn3yTGsEODEbzy8t2y+QBT.fxzTlUb7VowS0+iPelRn",
          "http://XfBK.wmXTrCXURrLyKnT9ZvQDUsMVMc10a6K,IygRHyKaaUNe54uWEf-kKlqd1pbJCQUCJQoeCbIW",
          "https://nRzWY.ajst9FoL2oujupmbej9Z9Y,d2D,TVyse-9PFxQnH9A3C0?"
        ],
        "má_umístění": [
          "https://wnkIfXUIsOmnnAjGIsypRCHwMqff.kopvCJANq1POeJKvP07Pn",
          "http://maMsewrqVePEVTyclTqNitZqxngFVqNG.vcpC0bUkqcrQ4SvFkcEitvF2WNJxUXNe+YpaqsZXuX1+Vy?ecgvnla=We&",
          "https://UOQrUmXAVWDDGpSkrF.dubW.iI?",
          "http://EEjlPOkOuIJeKakoVOVWGneXohqZZOTig.ljcnqhsPwh6b2xZJuhX,Gkj.l+WPcLvg6MjhchXahAZ9kvMvLEOa5YiEb,jou",
          "https://WItKuuAtuOmyflFzMxuxqN.zcfR4l?gfrzl=SJt&"
        ]
      },
      {
        "id": "https://mGkN.eruqtZ8G9VPGXZuTTMrgZzXKIfobFNBTwVki1WPi,r57l,9KhB7BCd0wTF9HroO+Likkn?yoeda&ztyez&",
        "type": [
          "consequat in elit officia Ut",
          "Lokalizace prostorového objektu"
        ],
        "má_lokalizaci": [
          "https://WdiAzUbVtFKVurwVoWYhhs.qjnXuWWe5pH+cVDW5P.jFzg4NdNeLYjgcs9v",
          "http://AvmWcoEAEISQTkn.jmtqa+52jJoMzg,hyKGUf9AC1F,vkHQns4?nxsvkrv=27uN&",
          "http://HhTxS.sjejfksSzcHqKR",
          "https://tpmnuvE.jhmoiuPeXZsfa1FEr,yEwbyldWTpxhmv0hITumjoygLJtdQQKSZVUdUj6GgPk2M9Y",
          "https://dZYQQcNXJVwiflXHEXlHxeXzMnREUPlNO.tmkaYKsIFFPnIw66pVCCntQPapgufyBHtPvGgk7Za50TdWhO?gpna=D&aolhtkw&vd&"
        ],
        "má_umístění": [
          "http://zOIPGHKBhkTGoqxY.ppgQiy?tric=cT&"
        ]
      }
    ],
    "popis": "in tempor culpa velit",
    "relevantní_do": [
      "http://oYqksEmyrLKjkVwjyrVThyYulE.cqwOVBkMgBBDpo7rUlExowqqiZ+2pXSWLUsq-iZc?",
      "http://YzQGkQStPpxersjzEAHmLpfdxKyjFJ.hjb0aND3xmEt?kzxgu=q6VW&p&bkri&",
      "https://g.hhjKpVOt1S1,yVtUX5qVdZiM9P9JuU6aIyHz8fOfxZI73K2xJiPK7iKDCdAL.23ptD.OWldE?ph&",
      "http://lZp.iiRnZX5FTjtmU,NC2.dSoZtic4.qKJTsHBOOVMR,QQIN6HAnIVz0?abszv=Z32H2&sbr=Oahsc&"
    ],
    "dlouhý_popis": [
      "magna exercitation sint ipsum",
      "reprehenderit culpa minim",
      "consequat"
    ],
    "registrace": [
      true,
      true,
      true,
      false,
      false
    ]
  };

  export default generate;