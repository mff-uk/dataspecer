# manager's components structure

The schema manager is a single-page application that communicates with the **[backend](../../../services/backend) service** to load and store data specifications and create schemas. It also opens the [editor](../../editor) in the context of data specification and schema that is being edited.

Similarly to the editor, the main components are **Store**, that represents storage of PIM and Data PSM resources and **Store Wrapper** which merges the stores into one.

**Artifact generators** generate schemas, documentation, images and transformations that are zipped and available to download by users.

To communicate with the **Backend service**, **Backend connector** is used.

![Editor's components](../../../documentation/diagrams/managerComponentView.png)
