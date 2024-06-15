import { CapabilityInterfaceGenerator } from "../capabilities/template-generators/capability-interface-generator";
import { TemplateConsumer, TemplateDependencyMap } from "../templates/template-consumer";
import { ImportRelativePath, TemplateDescription } from "./eta-template-renderer";
import { LayerArtifact } from "./layer-artifact";

interface ReactAppBaseTemplate extends TemplateDescription {
    placeholders: {
        error_component_name: string,
        error_component_path: ImportRelativePath,
        main_component: string,
        main_component_path: ImportRelativePath,
        import_statements: string[],
        artifacts_map: Map
    }
}

//TODO: Find better name
interface Map {
    [aggregateName: string]: {
        [capabilityName: string]: {
            componentName: string,
            props: { [propName: string]: string }
            relativePath: string
        }
    }
}

interface ReactAppBaseTemplateDependencyMap extends TemplateDependencyMap {
    artifacts: Map
}

export class ReactApplicationBaseGenerator extends TemplateConsumer<ReactAppBaseTemplate> {

    // <% for (let aggregateName in it.artifacts_map) { %><% for (let capabilityName in it.artifacts_map[aggregateName]) { %><% let item = it.artifacts_map[aggregateName][capabilityName] %>
    //     import <%= item.componentName %> from <%~ item.filepath %>;<% } %><% } %>
    constructor({ templatePath, filePath }: { templatePath: string, filePath: string }) {
        super(
            templatePath,
            filePath
        )
    }

    private getImportStatements(artifactsMap: Map): Set<string> {

        const importStatements = Object.values(artifactsMap)
            .reduce<string[]>((acc, capabilityArtifactsMap) => {
                const aggregateImports = Object.values(capabilityArtifactsMap)
                    .map(
                        artifact => `import ${artifact.componentName} from "${artifact.relativePath}";`
                    );
                return acc.concat(aggregateImports);
            }, []);

        return new Set<string>(importStatements);
    }

    processTemplate(dependencies: ReactAppBaseTemplateDependencyMap): LayerArtifact {

        // TODO: fix this
        const errorPageArtifact = new CapabilityInterfaceGenerator("./scaffolding/ErrorPage", "./ErrorPage.tsx").processTemplate();
        errorPageArtifact.exportedObjectName = "ErrorPage";

        // TODO: fix this
        const mainComponentArtifact = new CapabilityInterfaceGenerator("./scaffolding/Main", "./Main.tsx").processTemplate();
        mainComponentArtifact.exportedObjectName = "Main";

        const toCopy: LayerArtifact[] = [];
        ["Content", "Footer", "Sidebar", "TopBar"].forEach(name => {
            // TODO: fix this
            const componentArtifact = new CapabilityInterfaceGenerator(`./scaffolding/${name}`, `./${name}.tsx`).processTemplate();
            componentArtifact.exportedObjectName = name;
            toCopy.push(componentArtifact);
        })

        // TODO: fix this
        const indexArtifact = new CapabilityInterfaceGenerator("./scaffolding/index", "./index.tsx").processTemplate();
        indexArtifact.exportedObjectName = "root";
        toCopy.push(indexArtifact);

        // TODO: fix this
        const indexCssArtifact = new CapabilityInterfaceGenerator("./scaffolding/index_css", "./index.css").processTemplate();
        indexCssArtifact.exportedObjectName = "indexCss";
        toCopy.push(indexCssArtifact);

        // TODO: fix this
        const appCssArtifact = new CapabilityInterfaceGenerator("./scaffolding/App_css", "./App.css").processTemplate();
        appCssArtifact.exportedObjectName = "AppCss";
        toCopy.push(appCssArtifact);

        const packageArtifact = new CapabilityInterfaceGenerator("./scaffolding/package_json", "../package.json").processTemplate();
        packageArtifact.exportedObjectName = "package.json";
        toCopy.push(packageArtifact);
        
        const tsconfigArtifact = new CapabilityInterfaceGenerator("./scaffolding/tsconfig_json", "../tsconfig.json").processTemplate();
        tsconfigArtifact.exportedObjectName = "tsconfig.json";
        toCopy.push(tsconfigArtifact);

        const webVitalsArtifact = new CapabilityInterfaceGenerator("./scaffolding/reportWebVitals_ts", "./reportWebVitals.ts").processTemplate();
        webVitalsArtifact.exportedObjectName = "reportWebVitals";
        toCopy.push(webVitalsArtifact);

        const reactAppComponentTemplate: ReactAppBaseTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                artifacts_map: dependencies.artifacts,
                import_statements: [...this.getImportStatements(dependencies.artifacts)],
                error_component_path: {
                    from: this._filePath,
                    to: errorPageArtifact.filePath
                },
                error_component_name: errorPageArtifact.exportedObjectName,
                main_component: mainComponentArtifact.exportedObjectName,
                main_component_path: {
                    from: this._filePath,
                    to: mainComponentArtifact.filePath
                }
            }
        };
        const render = this._templateRenderer.renderTemplate(reactAppComponentTemplate);

        const layerArtifact: LayerArtifact = {
            exportedObjectName: "App",
            filePath: this._filePath,
            sourceText: render,
            dependencies: [
                errorPageArtifact,
                mainComponentArtifact,
                ...toCopy
            ]
        }

        return layerArtifact;
    }
}