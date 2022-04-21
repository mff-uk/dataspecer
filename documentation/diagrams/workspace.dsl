workspace "Dataspecer" "Description" {

    model {
        ontology = softwareSystem "Ontology database" "Contains the domain ontology that is used to create schemas and specifications"
        ontologyEditor = softwareSystem "Ontology editor" "External system that is used to edit the ontology"
        solid = softwareSystem "SOLID pods" "External storage for data specifications and data schemas" "Not implemented"
        user = person "Schema designer" "" "Internal user"
        dataModeller = person "Data modeller"
        dataspecer = softwareSystem "Dataspecer" "Tool for management of data specifications" "Internal system" {
            backend = container "Backend service" "Serves as a storage for data specifications and data schemas" "Typescript, Node" {
                bikeshedGenerator = component "Bikeshed generator" "Calls Python script to generate Bikeshed"
                bikeshed = component "Bikeshed compiler" "" "Python script"
                bikeshedGenerator -> bikeshed "Calls"
                storeModel = component "Store model" "Manages stores (contains PIM and Data PSM resources)"
                dataSpecificationModel = component "Data specification model" "Manages data specifications"
                prisma = component "Prisma database" "Local database for storing data specifications and store metadata" "SQLite" "Folder"
                filesystem = component "Filesystem" "Stores are saved directly into filesystem in JSON format" "" "Folder"

                storeModel -> prisma "Stores metadata"
                storeModel -> filesystem "Stores data"
                dataSpecificationModel -> prisma "Stores specifications metadata"
            }
            group "Used as a single web app" {
                editor = container "Schema editor" "Edits the given schema" "Typescript, React" "Web Front-End" {
                    group "core package" {
                        store = component "Store" "Store contains PIM and Data PSM resources that describe the constructed schema tree" "CoreResourceReader"
                        storeOperations = component "Atomic operations" "Operations that modify the resource in the store"
                        storeOperations -> store "Modify"

                        artifactsGenerators = component "Artifact generators" "Generates schemas and documentation"
                    }
                    storeWrapper = component "Store wrapper" "Manages multiple stores as one and provides interface for easier access to the data." "FederatedObservableStore"
                    storeWrapper -> store "Manages"
                    complexOperations = component "Complex operations" "Set of advanced operations that can perform large tasks"
                    complexOperations -> storeWrapper "Are executed on multiple stores"
                    complexOperations -> storeOperations "Use"

                    configuration = component "Configuration" "Creates the stores, provides the context in which the editor operates"
                    configuration -> store "Creates and registers stores"

                    addSurroundingsDialog = component "Add surroundings dialog" "Adds entities to the schema by expanding it"
                    addSurroundingsDialog -> storeWrapper "Adds resources"

                    cimAdapter = component "Cim adapter" "Loads data from the domain ontology database"
                    addSurroundingsDialog -> cimAdapter "Reads data"
                    configuration -> cimAdapter "Creates"

                    visualizedSchema = component "Visualized schema"
                    visualizedSchema -> storeWrapper "Reads data"

                    artifactsGenerators -> configuration "Read data specification"
                    artifactsGenerators -> storeWrapper "Read resources"

                }

                manager = container "Schema manager" "Manages data specifications, access, generates artifacts" "Typescript, React" "Web Front-End" {
                    backendConnector = component "Backend connector" "Communicates with the backend and retrieves and updates data specifications"
                    group "core package" {
                        store2 = component "Store" "Store contains PIM and Data PSM resources that describe the constructed schema tree" "CoreResourceReader"
                        artifactsGenerators2 = component "Artifact generators" "Generates schemas and documentation"
                    }
                    backendConnector -> store2 "Creates"
                    storeWrapper2 = component "Store wrapper" "Manages multiple stores as one and provides interface for easier access to the data." "FederatedObservableStore"
                    storeWrapper2 -> store2 "Manages"

                    artifactsGenerators2 -> backendConnector "Read data specification"
                    artifactsGenerators2 -> storeWrapper2 "Read resources"

                    store2 -> backend "Reads and writes specifications"
                }
            }
            cli = container "CLI service" "Tool for generating artifacts from the command line instead of using the manager directly" "Typescript, Node"

            manager -> configuration "Opens the editor in context of data schema"
            store -> backend "Reads and writes specifications"
            backendConnector -> backend "Reads and writes schemas and specifications"
            cli -> backend "Reads schemas and specifications"


            cimAdapter -> ontology "Reads the ontology to extend the schema"
            artifactsGenerators2 -> backend "Uses backend to generate Bikeshed html file"

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

        component manager managerComponentView "Manager components" {
            include *
        }

        component backend backendComponentView "Backend components" {
            include *
            autoLayout
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
            element "Folder" {
                shape Folder
            }
            element "Component" {
                background #50a8ff
                color #ffffff
            }
        }

    }

}
