---
title: "Genapp &ndash; Data-model based generator of an application prototype"
menu:
  docs:
    parent: "projects"
weight: 40
toc: true
---



# User manual &ndash; How to generate an application prototype?

The main goal for a user of the Genapp tool is to generate an application prototype. In order to achieve this goal, the
user has to perform a set of the following steps:

## Data specification and data structure models creation

1. First, the user needs to get a data specification to work with. Using the [Dataspecer tool](https://tool.dataspecer.com/), it is possible to either choose one of the existing specifications from the list or create a specification. Should the user decide to choose one of the existing specifications, then the following steps in this section may be skipped. To create a specfication, the user can click the `Create specification` button, which will lead to the creation of a new, empty, custom-named data specification.

2. To create a custom specification, which will be later used for application prototype generator, you can follow [this tutorial](https://dataspecer.com/docs/tutorial/basic-schema/) despite slight changes in Dataspecer tool UI.

Note / Tip: For easier and faster navigation in the following step, it is recommended to add a tag to a data specification, or copy the data specification IRI (this option is available on data specfication detail screen).

## Using Dataspecer manager

1. Once the user has created or chosen a data specification to work with, the next step is to navigate to _Dataspecer manager tool_ available under [this link](https://tool.dataspecer.com/manager/) or as https://tool.dataspecer.com/manager.

2. Within the Dataspecer manager, the user needs to find and access the data specfication created / chosen in the previous step. To find the data specification in the list of all available specifications, use the tag or the data specification IRI saved in the previous step. Once the data specification is found, click the "+" button on the right side and choose "Application graph" option from the proposed options list.
Please refer to the screenshots below for an illustration.

{{% data-spec-found "images/projects/genapp/data-specification-selection.png" %}}

{{% app-graph-choice "images/projects/genapp/app-graph-menu.png" %}}

3. After clicking the `Application graph` button, the user is asked to provide a language-tagged graph name and description. These serve only for easier graph identification within the data specification artifacts list. Click on the `Save changes` button once application graph name is provided. This will lead to a creation of an empty application graph which _needs to be edited_ in order to generate a useful application prototype.

{{% app-graph-choice "images/projects/genapp/sample-graph-dialog.png" %}}

## Application graph definition

As mentioned in the previous step, the created application graph is empty and does _not_ contain any nodes / edges to be generated. Therefore, the user is required to complete the application graph which complies with the specified application graph schema. By modifying the empty application graph, the user is able to capture and express the requirements on the generated application prototype.

1. Once the previous step is completed and an empty application graph created, find again the data specification in the Dataspecer manager tool and click on the ">" symbol on the left side of the screen.
(Tip: Select "Recently modified first" option on the top of the manager window to be able to quickly find the data specification).

2. The list of available artifacts for the data specification now contains the empty application graph artifact with the name defined in previous steps. To modify application graph content, click on the "three dots" icon next to the `Generate the application` button on the right side of the screen. Then, click the `Modify raw data` button as shown in the screenshot below.

{{% app-graph-definition "images/projects/genapp/app-graph-definition-choice.png" %}}

3. An application graph editor will open. The user is now able to edit the JSON format definition of the application graph according to the application graph schema. To facilitate the definition of the application graph, it is highly advised to use its JSON schema &ndash; application graph specification. The user can import the schema to the editor by pasting the following line into the graph editor.

```json
"$schema": "https://schemas.dataspecer.com/adapters/application-graph-model.v1.0.schema.json"
```

Using the [JSON schema of the application graph](https://schemas.dataspecer.com/adapters/application-graph-model.v1.0.schema.json), the editor will be able to better suggest missing properties and will provide examples of expected values.

4. Within the editor, complete the application graph definition by adding all desired application nodes (i.e. functional application units), application edges (i.e. transitions between different nodes) as well as the description of a data source.

Below are the examples of an application graph node, an edge and a datasource (in respective order):

```json
{
    "label": {
      "en": "Node label",
    },
    "iri": "https://example.org/application_graph/nodes/1",
    "structure": "https://ofn.gov.cz/schema/<ID of the structure model from Dataspecer>",
    "capability": "https://dataspecer.com/application_graph/capability/<capability identifier>",
    "config": {
      "pageTitle": {
        "en": "A node title to be shown"
      }
    }
}
```

```json
{
    "iri": "https://example.org/application_graph/edges/1",
    "source": "https://example.org/application_graph/nodes/1",
    "target": "https://example.org/application_graph/nodes/2",
    "type": "transition"
}
```

```json
{
    "label": "<datasource label>",
    "endpoint": "<endpoint url of the datasource>",
    "format": "rdf"
}

OR

{
    "label": "<datasource label>",
    "endpoint": {
        "read": "<endpoint url of the datasource for read operations>",
        "write": "<endpoint url of the datasource for write operations>"
    },
    "format": "rdf"
}
```

5. After all application graph modifications are finished, click on `Save` button and exit the graph editor.
6. Click on the `Generate the application` button on the right side of the page for the corresponding application graph to start application prototype generation. The application prototype generator has now started generating the application prototype based on the provided data specification and the provided application graph.
7. Wait for the application generator to finish the process of prototype generation. Once the generation has completed, the generated application source files will be provided to the user as a ZIP archive available for download.