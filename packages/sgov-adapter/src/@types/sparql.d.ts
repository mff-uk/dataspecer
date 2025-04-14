declare module "*.sparql.ts" {
    const contents: (parameters: Record<string, string>) => string;
    export = contents
}
