import { NewLineKind, printNode } from "ts-morph";
import ts, { 
    factory,
    createPrinter,
    createSourceFile,
    Expression,
    Node,
    NodeFlags,
    PropertyAccessExpression,
    ScriptTarget,
    ScriptKind,
    SyntaxKind,
    VariableDeclaration,
    VariableDeclarationList,
    ObjectLiteralElementLike
} from "typescript";
import { LdkitSchema, LdkitSchemaProperty } from "../ldkit-schema-model";
import { tryGetKnownDictionaryPrefix, convertToKebabCase, convertToPascalCase } from "../utils/utils";
import { SourceCodeWriter } from "./source-code-writer-model";
import { AggregateMetadata } from "../readers/aggregate-data-provider-model";

export class TypescriptWriter implements SourceCodeWriter {

    fileExtension: string = "ts";

    generateSourceFilePath(outputFileName: string) {
        const kebabCaseOutputFileName = convertToKebabCase(outputFileName);

        const finalOutputFilePath: string = "../../generated/" + [kebabCaseOutputFileName, this.fileExtension].join(".");
        console.log(`Output filepath: ${finalOutputFilePath}`);

        return finalOutputFilePath;
    }

    getSourceCodeFromMetadata(aggregateMetadata: AggregateMetadata): string {
        const printer = createPrinter({
            newLine: NewLineKind.CarriageReturnLineFeed,
            omitTrailingSemicolon: false,
            removeComments: false
        });
    
        const ldkitSchemaSourceFile = createSourceFile(
            this.generateSourceFilePath(aggregateMetadata.aggregateName),
            printNode(this.getLdkitSchemaNode(aggregateMetadata)),
            ScriptTarget.Latest,
            false, /*setParentNodes*/
            ScriptKind.TS
        );
    
        console.log(ldkitSchemaSourceFile.getFullText()); //getText(ldkitSchemaSourceFile));

        //console.log(printNode(this.getLdkitSchemaNode(aggregateMetadata), ldkitSchemaSourceFile, {emitHint: ts.EmitHint.SourceFile}));

        return printNode(this.getLdkitSchemaNode(aggregateMetadata));
    }

    private getLdkitSchemaNode(metadata: AggregateMetadata): Node {
        
        const convertedAggregateSchemaName: string = convertToPascalCase(metadata.aggregateName);
        const ldkitSchemaDeclaration = factory.createVariableDeclaration(
            `${convertedAggregateSchemaName}Schema`,
            undefined, // ts.ExclamationToken
            undefined, // type reference undefined to match ldkit's library type
            this.getSchemaAsObjectLiteral(metadata.dataSchema)
        );

        const declaration = factory.createVariableDeclarationList(
            [ldkitSchemaDeclaration],
            NodeFlags.Const
        );

        return this.getExportStatement(declaration);
    }

    private getExportStatement(node: readonly VariableDeclaration[] | VariableDeclarationList) {
        return factory.createVariableStatement(
            [factory.createToken(SyntaxKind.ExportKeyword)],
            node
        );
    }

    private getSchemaAsObjectLiteral(schema: LdkitSchema) {

        if (!("@type" in schema)) {
            throw new Error("Schema object does not contain required \"@type\" attribute.");
        }

        let properties: ObjectLiteralElementLike[] = this.getObjectLiteral(schema);

        return factory.createAsExpression(
            factory.createObjectLiteralExpression(properties, true),
            factory.createTypeReferenceNode(
                factory.createIdentifier("const"),
                undefined
            )
        );
    }

    private getObjectLiteral(targetObject: LdkitSchema): ObjectLiteralElementLike[] {

        const properties: ObjectLiteralElementLike[] = [];
        
        Object.entries(targetObject).map(attr => {
            console.log("Attribute: ", attr);
            const [propName, prop] = attr;
            const propertyValueNode: Expression = this.getPropertyValueExpression(prop);

            properties.push(
                factory.createPropertyAssignment(
                    propName,
                    propertyValueNode
                )
            );
        });

        return properties;
    }

    private getPropertyValueExpression(propertyValue: LdkitSchemaProperty | string | readonly string[] | any): Expression {
        
        switch (typeof propertyValue) {
            case "string":
                //console.log(`Found string: "${propertyValue}"`);
                const prefixMatch = undefined; //tryGetKnownDictionaryPrefix(propertyValue);

                if (!prefixMatch) {
                    return factory.createStringLiteral(propertyValue);
                }

                const [prefix, entity] = prefixMatch;
                return this.getObjectAccessExpression(prefix, entity);
            case "boolean":
                //console.log(`Found boolean: "${propertyValue}"`);
                return propertyValue
                    ? factory.createTrue()
                    : factory.createFalse();
            case "object":
                //console.log("Found object: ", propertyValue);
                return factory.createObjectLiteralExpression(this.getObjectLiteral(propertyValue), true);
            default:
                console.log("Not supported yet: ", propertyValue);
                throw Error(`Not implemented yet for ${propertyValue}`)
        }
    }

    private getObjectAccessExpression(objName: string, memberName: string): PropertyAccessExpression {
        return factory.createPropertyAccessExpression(
            factory.createIdentifier(objName),
            factory.createIdentifier(memberName)
        );
    }
}