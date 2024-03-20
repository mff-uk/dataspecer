import { AggregateConfiguration, AlternateApplicationConfiguration, ApplicationConfiguration, DatasourceConfig } from "../application-config";
import { Capability } from "../capabilities/capability-definition";
import { OverviewCapability } from "../capabilities/overview-generator";

type CapabilityPair = { aggName: string, capability: Capability };

class ApplicationGenerator {

    private appConfig: ApplicationConfiguration;

    constructor(appConfig: ApplicationConfiguration) {
        this.appConfig = appConfig;
    }

    getMatchingCapability(capabName: string, datasourceConfig: DatasourceConfig): Capability {
        const mapping: { [name: string]: Capability } = {
            "overview": new OverviewCapability(datasourceConfig)
        };

        const capabilityMatch: Capability | undefined = mapping[capabName];
        
        if (!capabilityMatch) {
            throw new Error("Unable to match to a capability.")
        }
        return capabilityMatch;
    }

    constructCapabilityAggregatePairs(config: AlternateApplicationConfiguration): CapabilityPair[] {
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

    generate() {
        // get application configuration
        const appConfig: ApplicationConfiguration = {
            targetLanguage: "ts",
            datasources: {
                "Catalog": [{ format: "rdf", endpointUri: "https://data.gov.cz/sparql" }] as DatasourceConfig[],
                "Dataset": [{ format: "rdf", endpointUri: "https://data.gov.cz/sparql" }] as DatasourceConfig[]
            },
            capabilities: {
                "Catalog": ["overview", "detail"],
                "Dataset": ["overview", "detail"]
            }
        };

        const appConfig2: AlternateApplicationConfiguration = {
            //targetLanguage: "ts",
            "Catalog": {
                capabilities: ["overview"],
                datasource: { format: "rdf", endpointUri: "https://data.gov.cz/sparql" } as DatasourceConfig,
            } as AggregateConfiguration,
            "Dataset": {
                capabilities: ["overview"],
                datasource: { format: "rdf", endpointUri: "https://data.gov.cz/sparql" } as DatasourceConfig,
            } as AggregateConfiguration
        }

        this.constructCapabilityAggregatePairs(appConfig2)
        .forEach(({aggName, capability}) => {
            capability.generateCapability()
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
    }
}