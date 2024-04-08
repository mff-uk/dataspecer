import { AggregateMetadata } from "../readers/aggregate-data-provider-model";

/**
 * Represents the type for the list of currently supported langauges.
 */
export type SourceCodeLanguageIdentifier = "ts";

export interface SourceCodeWriter {
    fileExtension: string,
    generateSourceFilePath(directoryPath: string, outputFileName: string): string;
    getSourceCodeFromMetadata(aggregateMetadata: AggregateMetadata): string;
}