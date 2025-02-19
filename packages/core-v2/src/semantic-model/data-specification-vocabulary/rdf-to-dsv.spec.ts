import { rdfToConceptualModel } from "./rdf-to-dsv";
import { conceptualModelToRdf } from "./dsv-to-rdf";
import { Cardinality, ConceptualModel, ObjectPropertyProfile } from "./dsv-model";

test("From RDF to DSV and back.", async () => {

  let inputRdf = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix dsv: <https://w3id.org/dsv#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.
@prefix skos: <http://www.w3.org/2004/02/skos/core#>.

<http://dcat-ap-cz/model> a dsv:ConceptualModel.

<https://dcat-ap/#Dataset> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsValue [
      dsv:inheritedProperty skos:prefLabel ;
      dsv:valueFrom <http://www.w3.org/ns/dcat#Dataset> ;
    ], [
      dsv:inheritedProperty <http://purl.org/vocab/vann/usageNote> ;
      dsv:valueFrom <http://www.w3.org/ns/dcat#Dataset> ;
    ];
    a dsv:ClassProfile;
    dsv:class <http://www.w3.org/ns/dcat#Dataset>.

<http://www.w3.org/ns/dcat#distribution-profile> dsv:domain <https://dcat-ap/#Dataset>;
    dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsValue [
      dsv:inheritedProperty skos:prefLabel ;
      dsv:valueFrom <http://dcat-ap/ns/dcat#Distribution> ;
    ], [
      dsv:inheritedProperty <http://purl.org/vocab/vann/usageNote> ;
      dsv:valueFrom <http://dcat-ap/ns/dcat#Distribution> ;
    ];
    dsv:cardinality <https://w3id.org/dsv#0n>;
    dsv:property <http://www.w3.org/ns/dcat#distribution>;
    a dsv:ObjectPropertyProfile;
    dsv:objectPropertyRange <http://dcat-ap/ns/dcat#Distribution>.

<https://dcat-ap-cz/#Dataset> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:profileOf <https://dcat-ap/#Dataset>;
    a dsv:ClassProfile.

<http://dcat-ap/ns/dcat#Distribution> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile, dsv:ClassProfile;
    dsv:class <http://www.w3.org/ns/dcat#Distribution>.
`;

  const actualModels = await rdfToConceptualModel(inputRdf);
  expect(actualModels.length).toBe(1);

  const expectedModel : ConceptualModel= {
    "iri": "http://dcat-ap-cz/model",
    "profiles": [{
      "iri": "https://dcat-ap/#Dataset",
      "prefLabel": null,
      "definition": null,
      "usageNote": null,
      "profileOfIri": [],
      "$type": ["class-profile"],
      "profiledClassIri": ["http://www.w3.org/ns/dcat#Dataset"],
      "inheritsValue": [{
        "inheritedPropertyIri": "http://www.w3.org/2004/02/skos/core#prefLabel",
        "propertyValueFromIri": "http://www.w3.org/ns/dcat#Dataset",
      }, {
        "inheritedPropertyIri": "http://purl.org/vocab/vann/usageNote",
        "propertyValueFromIri": "http://www.w3.org/ns/dcat#Dataset",
      }],
      "properties": [{
        "iri": "http://www.w3.org/ns/dcat#distribution-profile",
        "cardinality": Cardinality.ZeroToMany,
        "prefLabel": null,
        "definition": null,
        "usageNote": null,
        "profileOfIri": [],
        "profiledPropertyIri": ["http://www.w3.org/ns/dcat#distribution"],
        "$type": ["object-property-profile"],
        "rangeClassIri": [
          "http://dcat-ap/ns/dcat#Distribution"
        ],
        "inheritsValue": [{
          "inheritedPropertyIri": "http://www.w3.org/2004/02/skos/core#prefLabel",
          "propertyValueFromIri": "http://dcat-ap/ns/dcat#Distribution",
        }, {
          "inheritedPropertyIri": "http://purl.org/vocab/vann/usageNote",
          "propertyValueFromIri": "http://dcat-ap/ns/dcat#Distribution",
        }],
      } as ObjectPropertyProfile]
    }, {
      "iri": "https://dcat-ap-cz/#Dataset",
      "prefLabel": null,
      "definition": null,
      "usageNote": null,
      "profileOfIri": ["https://dcat-ap/#Dataset"],
      "$type": ["class-profile"],
      "profiledClassIri": [],
      "properties": [],
      "inheritsValue": [],
    }, {
      "iri": "http://dcat-ap/ns/dcat#Distribution",
      "prefLabel": null,
      "definition": null,
      "usageNote": null,
      "profileOfIri": [],
      "$type": ["class-profile"],
      "profiledClassIri": ["http://www.w3.org/ns/dcat#Distribution"],
      "properties": [],
      "inheritsValue": [],
    }]
  };
  expect(actualModels[0]).toStrictEqual(expectedModel);

  const actualRdf = await conceptualModelToRdf(actualModels[0] as any, {});
  // We can not compare to input due to blank nodes.
  expect(actualRdf).toBe(inputRdf = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix dsv: <https://w3id.org/dsv#>.
@prefix owl: <http://www.w3.org/2002/07/owl#>.
@prefix skos: <http://www.w3.org/2004/02/skos/core#>.


<http://dcat-ap-cz/model> a dsv:ConceptualModel.

<https://dcat-ap/#Dataset> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsValue _:n3-4.
_:n3-4 a dsv:PropertyInheritance;
    dsv:inheritedProperty skos:prefLabel;
    dsv:valueFrom <http://www.w3.org/ns/dcat#Dataset>.

<https://dcat-ap/#Dataset> dsv:inheritsValue _:n3-5.
_:n3-5 a dsv:PropertyInheritance;
    dsv:inheritedProperty <http://purl.org/vocab/vann/usageNote>;
    dsv:valueFrom <http://www.w3.org/ns/dcat#Dataset>.

<https://dcat-ap/#Dataset> a dsv:ClassProfile;
    dsv:class <http://www.w3.org/ns/dcat#Dataset>.

<http://www.w3.org/ns/dcat#distribution-profile> dsv:domain <https://dcat-ap/#Dataset>;
    dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:inheritsValue _:n3-6.
_:n3-6 a dsv:PropertyInheritance;
    dsv:inheritedProperty skos:prefLabel;
    dsv:valueFrom <http://dcat-ap/ns/dcat#Distribution>.

<http://www.w3.org/ns/dcat#distribution-profile> dsv:inheritsValue _:n3-7.
_:n3-7 a dsv:PropertyInheritance;
    dsv:inheritedProperty <http://purl.org/vocab/vann/usageNote>;
    dsv:valueFrom <http://dcat-ap/ns/dcat#Distribution>.

<http://www.w3.org/ns/dcat#distribution-profile> dsv:cardinality <https://w3id.org/dsv#0n>;
    dsv:property <http://www.w3.org/ns/dcat#distribution>;
    a dsv:ObjectPropertyProfile;
    dsv:objectPropertyRange <http://dcat-ap/ns/dcat#Distribution>.

<https://dcat-ap-cz/#Dataset> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile;
    dsv:profileOf <https://dcat-ap/#Dataset>;
    a dsv:ClassProfile.

<http://dcat-ap/ns/dcat#Distribution> dct:isPartOf <http://dcat-ap-cz/model>;
    a dsv:Profile, dsv:ClassProfile;
    dsv:class <http://www.w3.org/ns/dcat#Distribution>.
`);
});
