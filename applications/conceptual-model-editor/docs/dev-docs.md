[back to main](./main.md)

# Developer documentation

To start developing, follow the [about and install guide](./about-and-install.md). The architecture of `dscme` is depicted, as best as i could, [here](./architecture.md).

Other dev docs:

-   [folder structure](./dev-docs-folder-structure.md)
-   working with [aggregator](./dev-docs-working-with-aggregator.md)
-   working with [core-v2 types](./dev-docs-working-with-core2-types.md)

## Motivation

Conceptual modeling aims on creating abstract representations of systems to simplify communication between people involved and builds certain standards on knowledge exchange. It identifies entities, relationships, and constraints within a domain.
Application profiles are customized specifications that define how a set of concepts should be used for a particular application or domain.

### Similar tools

There are multiple conceptual modeling tools that let you model in ERD (entity-relationship diagrams), UML, flowcharts etc. `dscme` is a browser-based, open-source conceptual model editor. It is, by the looks of it, similar to other tools like Protégé Web, WebVOWL, and maybe others. It provides an environment for ontology and data modeling. Like these tools, it supports multiple models and offers various views on concepts, allowing for easier interaction. However, `dscme` differs by supporting IRIs for all resources, enabling precise identification and linking of web-based data. Additionally, by setting for example base IRIs for models and supporting application profiles, `dscme` offers more tailored and versatile metadata management capabilities compared to the more general features of other conceptual modeling tools.

## Chronological Progress Report

-   4/2023
    -   figma prototype
    -   first iteration with jointks, a tracer-bullet on working with it
-   5/2023
    -   integration to dataspecer/core types
    -   first rdf vocabulary loaded
    -   first concepts from slovník.gov.cz
    -   some visualization with jointjs
-   6/2023
    -   in-memory vocabularies
    -   research on diagramming libraries
        -   https://docs.google.com/spreadsheets/d/1b2dZXq4GI3eeqNKxobrqYva_OaLz0sEm9ggqtvr7-pE/edit#gid=0
    -   in the end - reactflow
    -   even though it has some drawbacks such as edge renderings, no edge layout customization
-   8-12/2023
    -   dataspecer/core-v2 came up
    -   application had to be reintegrated
    -   first connection to dataspecer backend, saving stuff
    -   concept manipulation - crud
    -   using reactflow and core-v2 EO 2023
    -   model colors
    -   visual models / views - impl for dataspecer/core-v2 pkg
    -   multiple views support
-   01/2024
    -   class boxes on the canvas have attributes
    -   edges on canvas have colors, labels and cardinalities
    -   central view management
    -   dialogs
        -   create model
        -   create relationship
        -   modify concept
    -   saving whole workspace to backend
-   02/2024
    -   rendering edges with existing ends
    -   view management for canvas
    -   local project/package manager
    -   enhancements on backend service
        -   listing views
        -   adding color support for models
    -   opening package from backend with `package-id` query parameter
    -   detail dialog shows attributes + cardinalities
-   03/2024
    -   visualization does only partial updates, no full rerenders
        -   subscribes to aggregator changes
    -   an attempt at auto-layout, too difficult
        -   (5/2024) another student now works solely on layouts
    -   random names generation
    -   color picker instead of completely free color picking
    -   support for opening a view directly with `view-id` query parameter
    -   internal change of naming profiles instead of usages
    -   start of work on application profiles
    -   language setting works even in visualization
-   04/2024
    -   hierarchical view on concepts and their profiles in concepts catalog
    -   `dscme` has first users
        -   first datasets modelled in `dscme` for other students -- LLM assistant
    -   auto-generation of iris based on names
    -   unifying dialog looks
    -   new class on `alt`+click on canvas
    -   model aliases
    -   default local model after cold start
    -   using the same colors in a new view
    -   support for profiling, showing values of profiled concept
    -   **the second half of april**
    -   let's start over
    -   we have to work with edges differently than before
        -   reverse engineering was wrong, the whole group had to come with a way of representing relationships and attributes
    -   rewriting relationships and attributes to the new style
    -   dataspecer/core-v2 wasn't even ready for that, had to do some impl there too
    -   util functions to distinguish relationships and attributes
    -   adjustments on lw-onto generator for the new approach
    -   i feel the time-crunch, new requirement still piling up
    -   util functions getting the name/description/.. easier
    -   model base iris
    -   showing generalizations/specializations in the detail dialog
    -   context menus on canvas
    -   aggregator didn't show profile info properly
        -   now it has the [`raw` values](./dev-docs-working-with-aggregator.md#with-raws)
    -   don't just take whatever profiled class had, take only what's necessary
        -   override checkbox
    -   domain and range can come in any order, we have to support that as well
-   05/2024
    -   profiles also need iris
    -   support for absolute and relative iris
    -   file structure refactor
    -   data-types support, easily extendable
    -   absolute iris for built-in lw-onto generator
        -   works well only within `dscme`, backend lw generator doesn't use the information about source model
    -   dialog buttons unification
    -   entityProxy for easier detail info reading
    -   drag-n-drop
    -   autosave to backend
    -   more refactoring, self-closing picker and context menus
    -   request to postpone the deadline
    -   started the documentation
    -   👁/🕶 changing the state only when needed
    -   fixing failed pipelines because some students push directly to main
    -   integration to the manager app / built-in project manager, based on the deployment
    -   dialog provider
    -   generalizations were done only for classes, the interface didn't say it worked otherwise
        -   adding that functionality
        -   labels for edge generalizations on canvas
        -   modification dialog now adds generalizations
    -   feedback for `💾pkg` button
    -   package and view query params are now part of `useQueryParams` hook
    -   maybe something else, you can check the git history

## Decisions and future improvements

We have listed future improvements [here](./future-improvements.md). Those are improvements a user could use. For developer improvements:

-   There could be some more work done on the `EntityProxy` so that it supports changes of fields as well and propagates them to the model/aggregator.
-   Model colors are now in visual models / views. It would be best to have them more centralized, possibly to have them in the package configuration. Individual views could also change colors of models though.
-   The color palette offer could be improved either by dynamic color generation based on that contrasts best with colors already selected. Or you could configure better contrasting colors as well. They are in tailwind format so tools like [coolors](https://coolors.co/) could do the trick.
-   State management is now done with contexts. I don't think it insufficient but some third party library might make it feel, from the DX point of view, a little nicer.
-   [Edge renderings](./future-improvements.md#edge-renderings)
-   Logging. I just used the plain old `console.log`. If there was something like Serilog is for .NET, it would be very pleasant. Some configuration settings could help with hiding unnecessary logs for the users
