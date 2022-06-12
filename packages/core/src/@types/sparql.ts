declare module "*.sparql" {
    const contents: (parameters: Record<string, string>) => string;
    export = contents
}
