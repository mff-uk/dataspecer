import { TemplateSourceCodeGenerator } from "../app-logic/template-app-logic-generator";
import {
    AggregateConfiguration,
    AlternateApplicationConfiguration,
    DataSourceType,
    DatasourceConfig
} from "../application-config";
import { Capability } from "../capabilities/capability-definition";
import { OverviewCapability } from "../capabilities/overview";
import { CodeGenerationArtifactMetadata, getRelativePath, wrapString } from "../utils/utils";

// {
//     path: "/overview/datasets",
//     element: <OverviewTable />,
//     children: [],
//     errorElement: <ErrorPage />
// }
type ReactRouterObject = {
    path: string,
    element: string,
    children: string[],
    errorElement: string
}

type CapabilityPair = { aggName: string, capability: Capability };

class ApplicationGenerator {

    //private appConfig: ApplicationConfiguration;
    private readonly appBaseTemplateGenerator: TemplateSourceCodeGenerator;

    constructor() { //appConfig: ApplicationConfiguration) {
        //this.appConfig = appConfig;
        this.appBaseTemplateGenerator = new TemplateSourceCodeGenerator();
    }

    private getMatchingCapability(capabName: string, datasourceConfig: DatasourceConfig): Capability {
        const mapping: { [name: string]: Capability } = {
            "overview": new OverviewCapability(datasourceConfig)
        };

        const capabilityMatch: Capability | undefined = mapping[capabName];

        if (!capabilityMatch) {
            throw new Error("Unable to match to a capability.")
        }

        return capabilityMatch;
    }

    private constructCapabilityAggregatePairs(config: AlternateApplicationConfiguration): CapabilityPair[] {
        const pairs: CapabilityPair[] = [];
        Object.entries(config)
            .forEach(([aggregateIdentifier, { capabilities, datasource }]) => {
                // LDkitGenerator.getObject
                // think about other metadata that might be needed in app generator -> filename base, schema name
                // but not in dataspecer for example -> schema only 
                capabilities.forEach(capabName => {
                    const capabilityTemplate: Capability = this.getMatchingCapability(capabName, datasource);
                    pairs.push({
                        aggName: aggregateIdentifier,
                        capability: capabilityTemplate
                    });
                })
            })

        return pairs;
    }

    private constructImportStatements(filepath: string, groupedCapabilities: { [aggName: string]: Capability[] }): string {
        let totalImportStatements: string[] = [];

        Object.entries(groupedCapabilities)
            .forEach(([aggName, aggCapabilities]) => {

                const aggregateImports = aggCapabilities
                    .map(({ entryPoint }) => {
                        const x = `import ${entryPoint!.objectName} from ${wrapString(getRelativePath(filepath, entryPoint!.objectFilepath))}`;
                        console.log(x)

                        return x;
                    })

                console.log("Imports: ", aggregateImports)

                totalImportStatements = totalImportStatements.concat(aggregateImports);
            })

        return totalImportStatements.join("\n");
    }

    private constructEntrypointsCode(groupedCapabilities: { [aggName: string]: Capability[] }): string {

        let totalEntrypoints: string[] = [];

        Object.entries(groupedCapabilities)
            .forEach(([aggName, aggCapabilities]) => {

                const aggregateEntrypoints = aggCapabilities
                    .map(({ identifier, entryPoint }) => {
                        console.log("Aggregate capability: ", aggName, identifier, entryPoint);
                        const browserRouterMember = {
                            path: ["", aggName, identifier].map(elem => elem.toLowerCase()).join("/"),
                            children: [] as string[],
                            element: `<${entryPoint!.objectName} />`,
                            errorElement: "<ErrorPage />"
                        } as ReactRouterObject;

                        const routerObjectString = JSON.stringify(browserRouterMember, undefined, 4).replaceAll("&quot;", '"');
                        console.log("Router object: ", routerObjectString);
                        return routerObjectString
                    });

                totalEntrypoints = totalEntrypoints.concat(aggregateEntrypoints);
            });

        return totalEntrypoints.join(",");
    }

    private generateApplicationBase(groupedCapabilities: { [aggName: string]: Capability[] }) {

        const errorPageComponent = this.appBaseTemplateGenerator
            .generateFromTemplateMetadata({
                exportedObjectName: "ErrorPage",
                targetSourceFilePath: "./generated/ErrorPage.tsx",
                templatePath: "../templates/scaffolding/ErrorPage"
            })

        const appComponentPath = "./generated/App.tsx";
        const appLandingComponentMetadata = this.appBaseTemplateGenerator
            .generateFromTemplateMetadata({
                exportedObjectName: "App",
                targetSourceFilePath: appComponentPath,
                templatePath: "../templates/scaffolding/App",
                placeHolders: {
                    error_component: errorPageComponent.objectName,
                    error_component_filepath: wrapString(getRelativePath(appComponentPath, errorPageComponent.objectFilepath)),
                    componentImports: this.constructImportStatements(appComponentPath, groupedCapabilities),
                    capability_components: this.constructEntrypointsCode(groupedCapabilities)
                }
            });

        this.appBaseTemplateGenerator.generateFromTemplateMetadata({
            exportedObjectName: "index",
            targetSourceFilePath: "./generated/index.tsx",
            templatePath: "../templates/scaffolding/index",
            placeHolders: {
                app_landing_component: appLandingComponentMetadata.objectName,
                landing_component_filepath: wrapString(getRelativePath("./generated/index.tsx", appLandingComponentMetadata.objectFilepath))
            }
        });

        this.appBaseTemplateGenerator.generateFromTemplateMetadata({
            exportedObjectName: "package",
            targetSourceFilePath: "./generated/package.json",
            templatePath: "../templates/scaffolding/package"
        })
    }

    generate() {
        // get application configuration
        // const appConfig: ApplicationConfiguration = {
        //     targetLanguage: "ts",
        //     datasources: {
        //         "Catalog": [{ format: DataSourceType.Rdf, endpointUri: "https://data.gov.cz/sparql" }] as DatasourceConfig[],
        //         "Dataset": [{ format: DataSourceType.Rdf, endpointUri: "https://data.gov.cz/sparql" }] as DatasourceConfig[]
        //     },
        //     capabilities: {
        //         "Catalog": ["overview", "detail"],
        //         "Dataset": ["overview", "detail"]
        //     }
        // };

        const appConfig2: AlternateApplicationConfiguration = {
            //targetLanguage: "ts",
            "Catalog": {
                capabilities: ["overview"],
                datasource: { format: DataSourceType.Rdf, endpointUri: "https://data.gov.cz/sparql" } as DatasourceConfig,
            } as AggregateConfiguration,
            "Dataset": {
                capabilities: ["overview"],
                datasource: { format: DataSourceType.Rdf, endpointUri: "https://data.gov.cz/sparql" } as DatasourceConfig,
            } as AggregateConfiguration
        }

        const groupedCapabilities: { [aggName: string]: Capability[] } = {};

        this.constructCapabilityAggregatePairs(appConfig2)
            .forEach(({ aggName, capability }) => {
                const entryPoint = capability.generateCapability(aggName);

                capability.entryPoint = entryPoint;

                console.log("After: ", capability.entryPoint);

                if (aggName in Object.keys(groupedCapabilities)) {
                    groupedCapabilities[aggName]?.push(capability);
                } else {
                    groupedCapabilities[aggName] = [capability];
                }
            });

        // foreach Pair<Capability, Aggregate> from application configuration:
        // generate data access layer artefacts
        // construct a DataAccessLayerGenerator instance based on config (i.e. LdkitGenerator, JsonDataAccessGenerator ...)
        // TODO: think about passing correct path as parameter for the generated artefacts

        // generate application layer artefacts
        // construct a ApplicationLayerGenerator instance based on

        // generate frontend artefacts

        // aggregate artefacts into an application
        // use generated artefacts to construct an app landing page, links / react routers ...
        console.log("Grouped: ", groupedCapabilities);

        this.generateApplicationBase(groupedCapabilities);
    }
}

const appGen = new ApplicationGenerator();
appGen.generate();
