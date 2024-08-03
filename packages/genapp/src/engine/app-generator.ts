import {
    ApplicationConfiguration,
    CapabilityConfiguration,
    DatasourceConfig
} from "../application-config";
import { CapabilityGenerator } from "../capabilities/capability-generator-interface";
import { CreateInstanceCapability } from "../capabilities/create-instance";
import { CustomCapabilityGenerator } from "../capabilities/custom-capability";
import { DeleteInstanceCapability } from "../capabilities/delete-instance";
import { DetailCapability } from "../capabilities/detail";
import { ListCapability } from "../capabilities/list";
import { StaticConfigurationReader, FileConfigurationReader } from "../config-reader";
import { CapabilityArtifactResultMap, LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "./react-app-base-stage";

// {
//     path: "/list/datasets",
//     element: <ListTable />,
//     children: [],
//     errorElement: <ErrorPage />
// }
type ReactRouterObject = {
    path: string,
    element: string,
    children: string[],
    errorElement: string
}

class ApplicationGenerator {

    private readonly configReader;

    constructor() {
        this.configReader = new StaticConfigurationReader();
    }

    // private getMatchingCapability(capabName: string, datasourceConfig: DatasourceConfig): Capability {
    //     const mapping: { [name: string]: Capability } = {
    //         "list": new ListCapability(datasourceConfig)
    //     };

    //     const capabilityMatch: Capability | undefined = mapping[capabName];

    //     if (!capabilityMatch) {
    //         throw new Error("Unable to match to a capability.")
    //     }

    //     return capabilityMatch;
    // }

    // private constructCapabilityAggregatePairs(config: ApplicationConfiguration): CapabilityPair[] {
    //     const pairs: CapabilityPair[] = [];
    //     Object.entries(config)
    //         .forEach(([aggregateIdentifier, { datasource, capabilities }]: [string, AggregateConfiguration]) => {
    //             // LDkitGenerator.getObject
    //             // think about other metadata that might be needed in app generator -> filename base, schema name
    //             // but not in dataspecer for example -> schema only
    //             Object
    //             .keys(capabilities)
    //             .forEach(capabName => {
    //                 const capabilityTemplate: Capability = this.getMatchingCapability(capabName, datasource);

    //                 pairs.push({
    //                     aggName: aggregateIdentifier,
    //                     capability: capabilityTemplate
    //                 });
    //             })
    //         })

    //     return pairs;
    // }

    // private constructImportStatements(filepath: string, groupedCapabilities: { [aggName: string]: Capability[] }): string {
    //     let totalImportStatements: string[] = [];

    //     Object.entries(groupedCapabilities)
    //         .forEach(([aggName, aggCapabilities]) => {

    //             const aggregateImports = aggCapabilities
    //                 .map(({ entryPoint }) => {
    //                     const x = `import ${entryPoint!.objectName} from ${wrapString(getRelativePath(filepath, entryPoint!.objectFilepath))}`;
    //                     console.log(x)

    //                     return x;
    //                 })

    //             console.log("Imports: ", aggregateImports)

    //             totalImportStatements = totalImportStatements.concat(aggregateImports);
    //         })

    //     return totalImportStatements.join("\n");
    // }

    // private constructEntrypointsCode(groupedCapabilities: { [aggName: string]: Capability[] }): string {

    //     let totalEntrypoints: string[] = [];

    //     Object.entries(groupedCapabilities)
    //         .forEach(([aggName, aggCapabilities]) => {

    //             const aggregateEntrypoints = aggCapabilities
    //                 .map(({ identifier, entryPoint }) => {
    //                     console.log("Aggregate capability: ", aggName, identifier, entryPoint);
    //                     const browserRouterMember = {
    //                         path: ["", aggName, identifier].map(elem => elem.toLowerCase()).join("/"),
    //                         children: [] as string[],
    //                         element: `<${entryPoint!.objectName} />`,
    //                         errorElement: "<ErrorPage />"
    //                     } as ReactRouterObject;

    //                     const routerObjectString = JSON.stringify(browserRouterMember, undefined, 4).replaceAll("&quot;", '"');
    //                     console.log("Router object: ", routerObjectString);
    //                     return routerObjectString
    //                 });

    //             totalEntrypoints = totalEntrypoints.concat(aggregateEntrypoints);
    //         });

    //     return totalEntrypoints.join(",");
    // }

    // private generateApplicationBase(groupedCapabilities: { [aggName: string]: Capability[] }) {

    //     const errorPageComponent = this.appBaseTemplateGenerator
    //         .generateFromTemplateMetadata({
    //             exportedObjectName: "ErrorPage",
    //             targetSourceFilePath: "./generated/src/ErrorPage.tsx",
    //             templatePath: "../templates/scaffolding/ErrorPage"
    //         })

    //     const appComponentPath = "./generated/src/App.tsx";
    //     const appLandingComponentMetadata = this.appBaseTemplateGenerator
    //         .generateFromTemplateMetadata({
    //             exportedObjectName: "App",
    //             targetSourceFilePath: appComponentPath,
    //             templatePath: "../templates/scaffolding/App",
    //             placeHolders: {
    //                 error_component: errorPageComponent.objectName,
    //                 error_component_filepath: wrapString(getRelativePath(appComponentPath, errorPageComponent.objectFilepath)),
    //                 componentImports: this.constructImportStatements(appComponentPath, groupedCapabilities),
    //                 capability_components: this.constructEntrypointsCode(groupedCapabilities)
    //             }
    //         });

    //     const indexPath = "./generated/src/index.tsx";
    //     this.appBaseTemplateGenerator.generateFromTemplateMetadata({
    //         exportedObjectName: "index",
    //         targetSourceFilePath: indexPath,
    //         templatePath: "../templates/scaffolding/index",
    //         placeHolders: {
    //             app_landing_component: appLandingComponentMetadata.objectName,
    //             landing_component_filepath: wrapString(getRelativePath(indexPath, appLandingComponentMetadata.objectFilepath))
    //         }
    //     });

    //     this.appBaseTemplateGenerator.generateFromTemplateMetadata({
    //         exportedObjectName: "package",
    //         targetSourceFilePath: "./generated/package.json",
    //         templatePath: "../templates/scaffolding/package"
    //     })
    // }

    // async generatePair({ aggName, capability }: CapabilityPair): Promise<CapabilityPair> {

    //     console.log(`CALL BEFORE '${aggName}|${capability.identifier}' generation`);

    //     const context: StageGenerationContext = {
    //         aggregateName: aggName
    //     };

    //     // TODO: context here is expected to have properties passed from aggregate-capability configuration
    //     const entrypoint = await capability.generateCapability(context);
    //     console.log(`CALL AFTER '${aggName}|${capability.identifier}' generation with '${entrypoint}' result`);

    //     capability.entryPoint = entrypoint;

    //     console.log("After: ", capability.entryPoint);

    //     return { aggName, capability } as CapabilityPair;

    //     // await promise
    //     //     .then(
    //     //         (entryPoint: any) => {
    //     //             capability.entryPoint = entryPoint;

    //     //             console.log("After: ", capability.entryPoint);

    //     //             if (aggName in Object.keys(grouped)) {
    //     //                 grouped[aggName]?.push(capability);
    //     //             } else {
    //     //                 grouped[aggName] = [capability];
    //     //             }
    //     //         });
    // }

    private getCapabilityGenerator(capabilityName: string, rootAggregateName: string, datasource: DatasourceConfig): CapabilityGenerator | null {
        const capabilityGeneratorMapping: { [capabilityName: string]: CapabilityGenerator | null } = {
            list: new ListCapability(rootAggregateName, datasource),
            detail: new DetailCapability(rootAggregateName, datasource),
            create: new CreateInstanceCapability(rootAggregateName, datasource),
            delete: new DeleteInstanceCapability(rootAggregateName, datasource),
        };

        const generator = capabilityGeneratorMapping[capabilityName];

        if (!generator) {
            return new CustomCapabilityGenerator(/* add configuration and datasource description here */);
        }

        return generator;
    }

    generateAllAggregateCapabilities(rootAggregateName: string, array: [string, CapabilityConfiguration][], datasource: DatasourceConfig) {

        const result: { [capabilityName: string]: Promise<LayerArtifact> } = {};

        for (const [capabilityName, capabilityConfig] of array) {
            const capabilityGenerator = this.getCapabilityGenerator(capabilityName, rootAggregateName, datasource);
            console.log(capabilityConfig);

            if (!capabilityGenerator) {
                return;
            }

            const promise = capabilityGenerator.generateCapability(capabilityConfig);
            result[capabilityName] = promise;
        }

        return result;
    }

    async processGeneratedPromises(promiseMap: { [capabilityName: string]: Promise<LayerArtifact> }) {
        const result: CapabilityArtifactResultMap = {};
        for (const [capabilityName, promise] of Object.entries(promiseMap)) {
            const capabilityOutput = await promise;

            result[capabilityName] = capabilityOutput;
        }
        return result;
    }

    async processAggregateGeneration(rootAggregateName: string) {
        const aggregateConfig = this.configReader.getAggregateConfiguration(rootAggregateName);

        console.log(`Generating for "${rootAggregateName}".`);
        const capabilityPromises = this.generateAllAggregateCapabilities(
            rootAggregateName,
            Object.entries(aggregateConfig.capabilities),
            aggregateConfig.datasource
        );

        if (!capabilityPromises) {
            throw new Error(`Nothing returned for "${rootAggregateName}"`);
        }

        return this.processGeneratedPromises(capabilityPromises);
    }

    async generate() {
        const appConfig: ApplicationConfiguration = this.configReader.getAppConfiguration();
        const generatedArtifactsByAggregateName: { [rootAggregateName: string]: CapabilityArtifactResultMap } = {};

        for (const aggregateName of this.configReader.getRootAggregateNames()) {
            const aggregateGeneratedCapabilities = await this.processAggregateGeneration(aggregateName);

            generatedArtifactsByAggregateName[aggregateName] = aggregateGeneratedCapabilities;
        }

        console.log("~".repeat(100));
        console.log(generatedArtifactsByAggregateName);
        const baseGeneratorStage = new ReactAppBaseGeneratorStage();

        const appBaseArtifact = baseGeneratorStage.generateApplicationBase(generatedArtifactsByAggregateName);
        baseGeneratorStage.artifactSaver.saveArtifact(appBaseArtifact);
    }
}

const appGen = new ApplicationGenerator();
appGen.generate();
