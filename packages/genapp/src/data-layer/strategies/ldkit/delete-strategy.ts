import { StageGenerationContext } from "../../../engine/generator-stage-interface";
import { DalGeneratorStrategy } from "../../strategy-interface";
import { InstanceDeleteLdkitGenerator } from "../../template-generators/ldkit/delete/instance-delete-generator";
import { LdkitSchemaProvider, SchemaProvider } from "./ldkit-schema-provider";

export class LdkitDeleteDalGenerator implements DalGeneratorStrategy {
    strategyIdentifier: string = "ldkit-instance-delete";

    private readonly _schemaProvider: SchemaProvider;

    constructor() {
        this._schemaProvider = new LdkitSchemaProvider();
    }

    async generateDataLayer(context: StageGenerationContext) {

        const ldkitSchemaArtifact = await this._schemaProvider.getSchemaArtifact(context.aggregateName);

        const instanceListReaderArtifact = new InstanceDeleteLdkitGenerator({
            aggregateName: context.aggregateName,
            filePath: `./writers/${this.strategyIdentifier}/${context.aggregateName.toLowerCase()}-instance-delete.ts`,
            templatePath: "./delete/data-layer/ldkit/instance-delete-mutator",
        })
        .processTemplate({
            sparqlEndpointUri: "<sparql endpoint URI>",
            ldkitSchemaArtifact: ldkitSchemaArtifact,
            pathResolver: context._.pathResolver
        });

        return Promise.resolve(instanceListReaderArtifact);
    }

}