import { rdfToConceptualModel } from "./rdf-to-dsv";
import { conceptualModelToRdf } from "./dsv-to-rdf";

test("From RDF to DSV and back.", async () => {

  const inputRdf = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix dsv: <https://w3id.org/dsv#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.
@prefix skos: <http://www.w3.org/2004/02/skos/core#>.


<http://dcat-ap-cz/model> a dsv:ConceptualModel.

<https://dcat-ap/#Dataset> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsProperties skos:prefLabel, <http://purl.org/vocab/vann/usageNote>;
    a dsv:ClassProfile;
    dsv:class <http://www.w3.org/ns/dcat#Dataset>.

<http://www.w3.org/ns/dcat#distribution-profile> dsv:domain <https://dcat-ap/#Dataset>;
    dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsProperties skos:prefLabel, <http://purl.org/vocab/vann/usageNote>;
    dsv:cardinality <https://w3id.org/dsv#0n>;
    dsv:property <http://www.w3.org/ns/dcat#distribution>;
    a dsv:ObjectPropertyProfile;
    dsv:objectPropertyRange <http://dcat-ap/ns/dcat#Distribution>.

<https://dcat-ap-cz/#Dataset> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsProperties skos:prefLabel, <http://purl.org/vocab/vann/usageNote>;
    dsv:profileOf <https://dcat-ap/#Dataset>;
    a dsv:ClassProfile.

<http://dcat-ap/ns/dcat#Distribution> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsProperties skos:prefLabel, <http://purl.org/vocab/vann/usageNote>;
    a dsv:ClassProfile;
    dsv:class <http://www.w3.org/ns/dcat#Distribution>.
`;

  const actualModels = await rdfToConceptualModel(inputRdf);
  expect(actualModels.length).toBe(1);

  const expectedModel = {
    "iri": "http://dcat-ap-cz/model",
    "profiles": [
      {
        "iri": "https://dcat-ap/#Dataset",
        "prefLabel": null,
        "usageNote": null,
        "profileOfIri": null,
        "$type": [
          "class-profile"
        ],
        "profiledClassIri": "http://www.w3.org/ns/dcat#Dataset",
        "properties": [
          {
            "iri": "http://www.w3.org/ns/dcat#distribution-profile",
            "cardinality": "0-n",
            "prefLabel": null,
            "usageNote": null,
            "profileOfIri": null,
            "profiledPropertyIri": "http://www.w3.org/ns/dcat#distribution",
            "$type": ["object-property-profile"],
            "rangeClassIri": [
              "http://dcat-ap/ns/dcat#Distribution"
            ]
          }
        ]
      },
      {
        "iri": "https://dcat-ap-cz/#Dataset",
        "prefLabel": null,
        "usageNote": null,
        "profileOfIri": "https://dcat-ap/#Dataset",
        "$type": [
          "class-profile"
        ],
        "profiledClassIri": null,
        "properties": []
      },
      {
        "iri": "http://dcat-ap/ns/dcat#Distribution",
        "prefLabel": null,
        "usageNote": null,
        "profileOfIri": null,
        "$type": [
          "class-profile"
        ],
        "profiledClassIri": "http://www.w3.org/ns/dcat#Distribution",
        "properties": []
      }
    ]
  };

  expect(actualModels[0]).toStrictEqual(expectedModel);

  const actualRdf = await conceptualModelToRdf(actualModels[0] as any, {});
  expect(actualRdf).toBe(inputRdf);
});
