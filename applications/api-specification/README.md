# Expanding the Dataspecer Tool for API Creation and Management

The aim of this text is to provide information regarding the project “Expanding the Dataspecer Tool for API Creation and Management”. The project was developed within the scope of class Research Project (NPRG070) at Charles University in Prague.

## Project Overview

Dataspecer is a tool which is being developed at the faculty of Mathematics and Physics of Charles University. The tool has advanced capabilities and mainly serves the purpose of managing as well as modeling data structures. Despite the fact that Dataspecer is a powerful tool, there exist some directions in which it could be improved.

The aim of this project is to extend Dataspecer with the feature of API creation and management, in particular generation of API specification and its maintenance.

After carefully analyzing Dataspecer as well as structures designed via this tool, it was decided to adopt resource-oriented approach for designing API specificaitons since the designed data structures were highly compatible with the REST API principles. OpenAPI was chosen as the format of generated API specificaitons, since it provides a language-agnostic framework for defining RESTful APIs.

A resource represents a fundamental concept when it comes to REST APIs. It not only has a type, but also associatiated data, relationships to other resources as well as collections of actions (operations) that perform different manipulations on them. While data structures crafted via Dataspecer do have a type, attributes and associations, the tool lacks the information about the operations which can be executed on them. Because of this, it is very important to obtain information regarding these operations when it comes to mapping the concept of resources of REST APIs to the data structures designed via Dataspecer and generating respective API specification in OpenAPI standard. The extension gathers this information via a form as well as fetches the data about the desired data specification (and its data structures).

The output of the program depends on two aspects - the collection of data structures (from the data specifications designed via Dataspecer) as well as additional information (mainly about the operations) provided by the user.

Please refer to the comprehensive documentation of the project via following links:

- PDF version: https://drive.google.com/file/d/1A8OeLyihcqZ41yh0A7Rm881noXUb8EUh/view?usp=sharing
- Dataspecer Website: https://dataspecer.com/docs/projects/api/

## Structure of the Repository

The source code of the project located in this ( `../applications/api-specification` ) directory is structured primarily within the `src` folder. The source code is divided into different directories - each serving a specific purpose, fostering clarity as well as maintainability.

The `src` directory includes several important directories as well as separate notable files.

### Directories

- **components** - This directory holds the components which were imported from the package shadcn-ui.
- **customComponents** - This directory holds custom components. Their goal is to serve specific demands of the project. These components are customized by utilizing pre-imported elements from components directory as well as hand-crafted HTML elements.
- **Models** - This directory stores TypeScript interfaces as well as types which are utilized widely across the codebase.

  The most important Model in this directory is `DataStructure` (located in `DataStructureModel.tsx`). Essential attributes - `name`, `givenName`, `id`, and `fields` are defined within this model (interface). Additionally `Field` interface defines details for each field. These details are: `name`, `type`, `classType`, `nestedFields`, `isArray` and `isMandatory`. It is important to note that `Field` is able to represent attributes as well as associations. In case of primitive type `Field.type` is populated, however an association is able to have a nested structure below it. In this case `Field.type` contains "Object" and `Field.classType` contains the type of the object. Additionally, `nestedFields` are populated accordingly. This way the whole, multi-level representation of data structure is considered.

- **Props** - This directory holds type definitions outlining properties which are passed to the custom components.

### Notable Files

- **DataStructureFetcher** (.tsx) - This file contains the logic of fetching the information about current data specification - in particular its data structures. Initially, information about data specification is retrieved from the Dataspecer backend. More precisely, the information about each data structure within data specification is fetched and is stored in the predefined format - `DataStructure` (from `DataStructureModel.tsx`).

- **OApiGenerator** (.tsx) - The file holds the logic about generating API specification according to the OpenAPI standard. The primary method is called `generateOpenAPISpecification` which in turn calls helper methods. `generateOpenAPISpecification` takes two parameters - `dataStructures` and `userInput`.
  `dataStructures` is the collection of data structures that were fetched from the Dataspecer backend (as described above). `userInput` represents the information provided by the user via the form.

  The program iterates over the fetched data structures in order to create components and schemas. It also processes user-provided information to create paths and operations constructs according to the OpenAPI standard. To sum up, the generator consolidates this data and the result is OpenAPI Specificaiton.

- **FormValidationSchema** (.tsx) - This file holds the logic about the validation of the input. It enforces the uniqueness of operation type and endpoint (path) combinations. Additionally, unique names for operations are ensured. Validation utilizes zod library.

- **DataTypeConverter** (.tsx) - This file contains logic for data type conversions. There are two purposes when it comes to the converter - translating the names of the data types from Czech to English and converting English data types to the ones which are accepted by the OpenAPI standard.

- **MainForm** (.tsx) - This file contains the logic about the UI. When it comes to MainForm component, two types of data is fetched - the datastructures from the target data specification as well as presaved form values (if present). Upon submission the configuration (user-provided information) is stored on the Dataspecer backend and corresponding OpenAPI specification is generated. Because of this, the user is able to continue designing their API from their last checkpoint.

## Build Instructions

1. Firstly, clone the whole mono repository via `git clone ...`
2. Please set up the local environment by creating the file .env.local. In this file, introduce local environment variable called VITE_BACKEND and set it to the backend url (https://backend.dataspecer.com).
3. In order to install all packages, please run `npm install` from the root of the repository.
4. In order to build all dependencies of this application, please run `npm run build`.

In case you only need to build this applcation, run `npm run build` specifically from this directory.
It is possible to run the live server via `npm run dev` from this directory. Before starting the live server, all of the dependencies have to be built.

Note: In n case the user wants to run this application locally the user needs to update the URL in the browser.
The part of the URL can be copied from the production env.

The URL for accessing extension for creating sample OpenAPI specification for sample data structure - Tourist Destinations could be:

http://localhost:YOUR_PORT_NUMBER/?package-iri=https%3A%2F%2Fofn.gov.cz%2Fdata-specification%2F26bfd105-3d19-4664-ad8b-d6f84131d099&model-iri=3f6ce178-547f-4de5-91a1-11e271b63a63

Please know that for the full experience of the feature on your local machine in addition to this component api-specification (`applications/client`) additional components need to be run. These components are:

- structure editor (located in: `applications/client`)
- dataspecer manager (located in: `applications/manager`)
- backend (located in: `services/backend`)
