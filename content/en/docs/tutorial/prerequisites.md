---
title: "Prerequisites"
description: "Prerequisites to operate the Dataspecer."
lead: "Prerequisites to operate the Dataspecer."
menu:
  docs:
    parent: "tutorial"
weight: 30
toc: true
---

As stated in the [previous chapter]({{< ref "data-modeling-problematics.md" >}}), you need already existing domain ontology to start modeling schemas from it. Currently, we only support [Semantic Government Vocabulary (SGOV) of the Public administration services of the Czech Republic](https://opendata-mvcr.github.io/ssp/) based on UFO-A ontology[^ufo-a], as our current goal is to create [OFNs](https://data.gov.cz/ofn/).

We are working to support other formats of ontologies, such as RDF Schema, OWL, Schema.org, or Wikidata.

## Tourist destinations

In the next chapter, we will create a schema for Tourist destinations and demonstrate how the data designer can use the tool to simplify the work of creating and managing schema.

You can explore the ontology in the [ShowIt tool](https://xn--slovnk-7va.gov.cz/prohl%C3%AD%C5%BE%C3%ADme/pojem?iri=https://slovn%C3%ADk.gov.cz/datov%C3%BD/turistick%C3%A9-c%C3%ADle/pojem/turistick%C3%BD-c%C3%ADl) or directly through the SPARQL endpoint. You may notice that the tourist destination is also a public place, having an owner and operator, contact information, and many other associations, which create a large graph of connected objects.

The goal is to select only the desired associations for the final schema. For example, suppose we want to export all the necessary data in CSV for a web portal with exciting places in the Czech Republic. In that case, we surely won't need to export operators, as this is not information that would interest possible tourists. On the other hand, to import data in XML, a reference to an existing operator will be required to have everything valid.

[^ufo-a]: Guizzardi, Giancarlo et al. ‘UFO: Unified Foundational Ontology’. 1 Jan. 2022 : 167 – 210.

