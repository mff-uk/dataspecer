import path from "path";

export class CodeGenerationArtifactMetadata {
    //private readonly map: { [key: string]: string; }
    readonly objectName: string;
    readonly objectFilepath: string;

    constructor(map: {[objectName: string]: string; }) {
        const entries = Object.entries(map);
        console.log("Entries: ", entries); 
        // if (entries.length !== 1 || !entries[0]) {
        //     throw new Error("Incorrect mapping of generated objects");
        // }

        const entry = entries[0] ?? ["", ""];
        [this.objectName, this.objectFilepath] = entry;

        // if (!this.objectName || !this.objectFilepath) {
        //     throw new Error("Incorrectly generated object");
        // }
    }
}

export function wrapString(wrappee: string, wrapperSymbol: string = "\"") {
    return `${wrapperSymbol}${wrappee}${wrapperSymbol}`;
}

export function getRelativePath(sourcePath: string, targetPath: string): string {
    // removes file extension
    console.log("--utils SRC: ", sourcePath);
    console.log("--utils Target: ", targetPath);

    targetPath = targetPath.substring(0, targetPath.lastIndexOf(".") < 1 ? targetPath.length : targetPath.lastIndexOf("."));

    const prefix = path.dirname(targetPath).startsWith(path.dirname(sourcePath)) ? "./" : "";

    const result = prefix + path.posix.relative(path.dirname(sourcePath), targetPath);
    console.log(result);
    return result;
}

// export function convertGeneratioResultToGenerationPair(generatedResult: CodeGenerationResult): CodeGenerationPair[] {
//     return Object
//         .entries(generatedResult)
//         .map(entry => { 
//             return { 
//                 objectName: entry[0],
//                 objectFilepath: entry[1]
//             } as CodeGenerationPair
//         });
// }

// export function getGeneratedResultObject(generatedResult: CodeGenerationResult) {
//     const generatedEntries = Object.entries(generatedResult);
//     if (!generatedEntries || generatedEntries.length !== 1) {
//         throw new Error("Incorrect generated result object");
//     }

//     return generatedEntries[0]?.[0];
// }

// export function getGeneratedResultFilepath(generatedResult: CodeGenerationResult): string {
//     const generatedEntries = Object.entries(generatedResult);
//     if (!generatedEntries || generatedEntries.length !== 1) {
//         throw new Error("Incorrect generated result object");
//     }

//     return generatedEntries[0]?.[1] ?? "";
// }