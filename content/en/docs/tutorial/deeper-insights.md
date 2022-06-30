---
title: "Deeper insights"
description: "Deeper insights into different parts of the app."
lead: "Deeper insights into different parts of the app."
menu:
  docs:
    parent: "tutorial"
weight: 50
toc: true
---

Many of the [advanced features]({{< ref "data-modeling-problematics.md#future-plans" >}}) have not been implemented yet. This page will be updated when new functionality appears.

## Reusing data specifications

It is possible to reuse existing data specifications from inside another specification by referencing it instead of creating classes with attributes and associations all over again. The reuse is designed in a way that is applied to not only a model itself but also to the final schemas that are created. Reuse on the schema level (JSON schema, or XML schema) references reused schemas instead of copying subschemas into a single large file.

Only the root class from the data schema may be reused this way. Moreover, the data specification, where the reused schema belongs, must be explicitly reused by the data specification with the schema that uses the reuse.

We will demonstrate this on Barrier-free access, a class that has about 30 attributes regarding wheelchair accessibility.

1. We will start with two data specifications. One with already defined schema for Barrier-free access and one for partially defined Tourist destination, which will reuse the former specification.
2. Go to the detail of the second data specification, and in the reuse part, select the Barrier-free access data specification to be reused. {{% tutorial-image "images/tutorial/advanced/reuse.png" %}}
3. Go to the editor through the "Edit" button where you want to reuse the Barrier-free access.
4. Add Barrier-free access, and you should be able to replace the class with the existing schema. {{% tutorial-image "images/tutorial/advanced/reuse_editor.png" %}} The dialog prompts schemas that are linked. {{% tutorial-image "images/tutorial/advanced/reuse_dialog.png" %}}

Generated JSON file will then contain
```json
"has_barrier-free_access": {
    "type": "array",
    "items": {
        "$ref": "barrier-free-access/barrier-free-access/schema.json"
    }
}
```

## Format-specific attributes

Some formats offer unique features and constructs that are not found in other formats, and require specific settings. For this purpose, components of a data schema may support extensions for these specific features.

### XML

In XML, namespaces are used to differentiate elements which have the same name but are defined in different "vocabularies" and may have a largely different meaning.

Namespaces are declared in XML documents using an IRI that uniquely identifies the namespace, usually bound to a prefix that is used to refer to the namespace. For this purpose, both these attributes can be set for a schema.

{{% tutorial-image "images/tutorial/xml-specific/namespace-attributes.png" %}}

This setting affects generators of XSD and XSLT. For example, without a namespace, XSD would start as
```xml
<?xml version="1.0" encoding="utf-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" version="1.1" elementFormDefault="unqualified">
```

When the attributes are set as above, the schema uses `targetNamespace` to place all elements inside the specified namespace:
```xml
<?xml version="1.0" encoding="utf-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" version="1.1" elementFormDefault="qualified" targetNamespace="http://example.org/" xmlns:example="http://example.org/">
```

A schema with a namespace can also be reused from another schema, and a schema with no namespace can be reused from a schema with a namespace. In any case, the elements coming from either schema keep their namespaces when used together in a single XML document.

When the "namespace" option is enabled, *both* the prefix and the namespace IRI must be specified. 