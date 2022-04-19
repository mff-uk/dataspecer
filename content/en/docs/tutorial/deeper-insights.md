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
