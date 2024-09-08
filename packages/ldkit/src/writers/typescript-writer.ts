import { printNode } from "ts-morph";
import ts, {
    factory,
    Expression,
    Node,
    NodeFlags,
    PropertyAccessExpression,
    SyntaxKind,
    VariableDeclaration,
    VariableDeclarationList,
    ObjectLiteralElementLike
} from "typescript";
import { LdkitSchema, LdkitSchemaProperty } from "../ldkit-schema-model";
import { convertToKebabCase, convertToPascalCase } from "../utils/utils";
import { SourceCodeWriter } from "./source-code-writer-model";
import { AggregateMetadata } from "../readers/aggregate-data-provider-model";

export class TypescriptWriter implements SourceCodeWriter {

    fileExtension: string = "ts";

    generateSourceFilePath(directoryPath: string, outputFileName: string) {
        const kebabCaseOutputFileName = convertToKebabCase(`${outputFileName} ldkitschema`);

        const finalOutputFilePath: string = directoryPath + [kebabCaseOutputFileName, this.fileExtension].join(".");
        console.log(`Output filepath: ${finalOutputFilePath}`);

        return finalOutputFilePath;
    }

    getSourceCodeFromMetadata(aggregateMetadata: AggregateMetadata): string {
        const ldkitSchemaRootNode = this.getLdkitSchemaRootNode(aggregateMetadata);
        const printed: string = printNode(ldkitSchemaRootNode);

        return printed;
    }

    private getLdkitSchemaRootNode(metadata: AggregateMetadata): Node {

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
            const [propName, prop] = attr;
            const propertyValueNode: Expression = this.getPropertyValueExpression(prop);
            const propertyNameNode: string = this.getPropertyNameNode(propName);

            properties.push(
                factory.createPropertyAssignment(propertyNameNode, propertyValueNode)
            );
        });

        return properties;
    }

    private getPropertyNameNode(name: string): string {
        if (!name) {
            throw new Error("Attepmting to use non-valid string as property name");
        }

        if (!name.match(/^[a-z0-9_]+$/i)) {
            return `"${factory.createStringLiteral(name).text}"`;
        }

        return name;
    }

    private getPropertyValueExpression(propertyValue: LdkitSchemaProperty | string | readonly string[] | any): Expression {

        switch (typeof propertyValue) {
            case "string":
                return factory.createStringLiteral(propertyValue);
            case "boolean":
                return propertyValue
                    ? factory.createTrue()
                    : factory.createFalse();
            case "object":
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