import { describe, test, expect } from "vitest";
import { createDefaultSemanticModelBuilder } from "./semantic-model/semantic-model-builder.ts";
import { createDefaultProfileModelBuilder } from "./profile-model/profile-model-builder.ts";
import { createShaclForProfile } from "./shacl.ts";
import { shaclToRdf } from "./shacl-to-rdf.ts";

describe("createShaclForProfile", () => {

  test("Default test.", async () => {

    // DCAT
    const dcat = createDefaultSemanticModelBuilder(
      "http://www.w3.org/ns/dcat#");
    const dcatCatalog = dcat.class({
      iri: "Catalog",
      name: { "en": "Catalog" },
    });

    // FOAF
    const foaf = createDefaultSemanticModelBuilder(
      "http://xmlns.com/foaf/0.1/");
    const foafHomepage = foaf.property({
      iri: "homepage",
      name: { "en": "homepage" },
      externalDocumentationUrl:
        "https://semiceu.github.io/DCAT-AP/releases/3.0.0#Catalogue.homepage",
    });
    const foafDocument = foaf.class({
      iri: "Document",
      name: { "en": "Document" },
    });

    // DCAT-DEFAULT
    const dap = createDefaultProfileModelBuilder(
      "https://mff-uk.github.io/specifications/dcat-dap/#");
    const dapCatalog = dap.class({
      iri: "Catalog",
      usageNote: { "en": "A Web-based data catalog ..." },
    }).reuseName(dcatCatalog);
    const dapDocument = dap.class({
      iri: "Document",
    }).reuseName(foafDocument);
    const dapHomepage = dap.property({
      iri: "Catalog.homepage",
      usageNote: { "en": "foaf:homepage is an inverse functional property" },
    }).reuseName(foafHomepage)
      .domain(dapCatalog).range(dapDocument);

    // DCAT-AP
    const ap = createDefaultProfileModelBuilder(
      "https://mff-uk.github.io/specifications/dcat-ap/#");
    const apCatalog = ap.class({
      iri: "Catalogue",
    }).reuseName(dapCatalog).reuseUsageNote(dapCatalog);
    const apDocument = ap.class({
      iri: "Document",
    }).reuseName(dapDocument);
    ap.property({
      iri: "Catalogue.homepage",
      cardinality: [0, 1],
    }).reuseName(dapHomepage).reuseUsageNote(dapHomepage)
      .domain(apCatalog).range(apDocument);

    // This should copy or reference all rules for "apCatalog".
    const apMyCatalog = ap.class({
      iri: "MyCatalog",
      name: {"en": "My Catalog"},
    });
    ap.generalization(apCatalog, apMyCatalog);

    const shacl = createShaclForProfile(
      [dcat.build(), foaf.build()],
      [dap.build(), ap.build()],
      ap.build());

    console.log(await shaclToRdf(shacl, {}));

    // <https://semiceu.github.io/DCAT-AP/releases/3.0.0/shacl/dcat-ap-SHACL.ttl#dcat:CatalogShape>
    //  shacl:targetClass dcat:Catalog .
  });

});
