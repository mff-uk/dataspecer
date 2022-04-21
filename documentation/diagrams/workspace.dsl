workspace "Dataspecer" "Description" {

    model {
        ontology = softwareSystem "Ontology database" "Contains the domain ontology that is used to create schemas and specifications"
        ontologyEditor = softwareSystem "Ontology editor" "External system that is used to edit the ontology"
        solid = softwareSystem "SOLID pods" "External storage for data specifications and data schemas" "Not implemented"
        user = person "Schema designer" "" "Internal user"
        dataModeller = person "Data modeller"
        dataspecer = softwareSystem "Dataspecer" "Tool for management of data specifications" "Internal system" {
            group "Used as a single web app" {
                editor = container "Schema editor" "Edits the given schema" "Typescript, React" "Web Front-End" {
                    group "core package" {
                        storeModel = component "Store model" "Store contains PIM and Data PSM resources that describe the constructed schema tree" "CoreResourceReader"
                        storeOperations = component "Store operations" "Atomic operations that modify the resource in the store"
                        storeOperations -> storeModel "Modify"

                        artifactsGenerators = component "Artifact generators" "Generates schemas and documentation"
                    }
                    storeModelWrapper = component "Store model wrapper" "Manages multiple stores as one and provides interface for easier access to the data." "FederatedObservableStore"
                    storeModelWrapper -> storeModel "Manages"
                    complexOperations = component "Complex operations" "Set of advanced operations that can perform large tasks"
                    complexOperations -> storeModelWrapper "Are executed on multiple stores"
                    complexOperations -> storeOperations "Use"

                    configuration = component "Configuration" "Creates the stores, provides the context in which the editor operates"
                    configuration -> storeModel "Creates and registers stores"

                    addSurroundingsDialog = component "Add surroundings dialog" "Adds entities to the schema by expanding it"
                    addSurroundingsDialog -> storeModelWrapper "Adds resources"

                    visualizedSchema = component "Visualized schema"
                    visualizedSchema -> storeModelWrapper "Reads data"

                    artifactsGenerators -> configuration "Read data specification"
                    artifactsGenerators -> storeModelWrapper "Read resources"

                }
                manager = container "Schema manager" "Manages data specifications, access, generates artifacts" "Typescript, React" "Web Front-End"
            }
            backend = container "Backend service" "Serves as a storage for data specifications and data schemas" "Typescript, Node"
            cli = container "CLI service" "Tool for generating artifacts from the command line instead of using the manager directly" "Typescript, Node"

            manager -> configuration "Opens the editor in context of data schema"
            storeModel -> backend "Reads and writes specifications"
            manager -> backend "Reads and writes schemas and specifications"
            cli -> backend "Reads schemas and specifications"


            addSurroundingsDialog -> ontology "Reads the ontology to extend the schema"

            manager -> solid "Reads and writes schemas and specifications"
            editor -> solid "Reads and writes specifications"
            cli -> solid "Reads schemas and specifications"
        }

        // dataspecer -> ontology "Reads the ontology as the user is expanding the schema"
        user -> dataspecer "Uses the tool to create data schemas"
        // dataspecer -> solid "Uses external storage"
        dataModeller -> ontologyEditor "Uses the external ontology editor to create the ontology"
        ontologyEditor -> ontology "Modifies the ontology"
    }

    views {
        systemContext dataspecer dataspecerView "Dataspecer system context" {
            include * ontologyEditor dataModeller
            autoLayout
        }

        container dataspecer dataspecerContainerView "Dataspecer containers" {
            include * solid ontology
        }

        component editor editorComponentView "Editor components" {
            include *
        }

        styles {
            element "Internal system" {
                background #438dd5
                color #ffffff
            }

            element "Existing System" {
                background #999999
                color #ffffff
            }

            element "Internal user" {
                background #08427b
                color #ffffff
            }

            element "Person" {
                shape Person
            }

            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Web Front-End"  {
                shape WebBrowser
            }
            element "Not implemented" {
                color #969696
                shape Folder
            }
            element "Component" {
                background #50a8ff
                color #ffffff
            }
        }

    }

}
