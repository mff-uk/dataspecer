import { AggregateMetadata } from "./readers/aggregate-data-provider-model";
import { getSupportedWriter } from "./utils/utils";
import { SourceCodeWriter } from "./writers/source-code-writer-model";

export class LdkitArtefactGenerator {

    private writer: SourceCodeWriter;

    constructor() {
        this.writer = getSupportedWriter("ts");
    }

    generateSourceFile(metadata: AggregateMetadata): string {
        return this.writer.getSourceCodeFromMetadata(metadata);
    }
}