# manager application

Manager or Schema manager is a web application where you can create new data specifications and data schemas and generate artifacts. The manager then redirects the user to the [editor](../editor) to edit the schema. Currently, the manager is a simple application, but there are plans to extend it. The manager should configure generators and data schema, manage user permissions, support SOLID, etc.

The manager communicates with the [backend](../../services/backend) service.

## Documentation

See the [project structure](documentation/2022-04-21-project-structure.md), individual directories for README.md files, or documentation directly in the code.

Most relevant starting component is [src/App.tsx](src/App.tsx).

---

## Build instructions

Please use the [build instructions from the editor](../editor/README.md). The applications are similar in structure.
