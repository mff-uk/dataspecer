import { LayerArtifact } from "../engine/layer-artifact";
import { ImportRelativePath, TemplateModel } from "../engine/templates/template-interfaces";
import { TemplateConsumer, TemplateDependencyMap, TemplateMetadata } from "../engine/templates/template-consumer";
import { CopyTemplateProcessor } from "../capabilities/template-generators/capability-interface-generator";
import { SidebarComponentTemplateProcessor } from "../presentation-layer/template-generators/sidebar-template-processor";

interface ReactAppBaseTemplate extends TemplateModel {
    placeholders: {
        error_component_name: string,
        error_component_path: ImportRelativePath,
        main_component: string,
        main_component_path: ImportRelativePath,
        page_template_component: string,
        page_template_component_path: ImportRelativePath,
        import_statements: string[],
        artifacts_map: CapabilityRouteComponentMap
    }
}

export type ReactRouteComponentDescription = {
    componentName: string,
    relativePath: string,
    capability: {
        type: string,
        label: string
    },
    props: { [propName: string]: string }
}

export type CapabilityRouteComponentMap = {
    [capabilityPath: string]: ReactRouteComponentDescription
}

export interface ReactAppBaseTemplateDependencyMap extends TemplateDependencyMap {
    capabilityMap: CapabilityRouteComponentMap
}

export class ReactApplicationBaseGenerator extends TemplateConsumer<ReactAppBaseTemplate> {

    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata)
    }

    private getImportStatements(artifactsMap: CapabilityRouteComponentMap): Set<string> {
        const importStatements = Object
            .values(artifactsMap)
            .map(capabilityArtifact => `import ${capabilityArtifact.componentName} from "${capabilityArtifact.relativePath}";`);

        return new Set<string>(importStatements);
    }

    async processTemplate(dependencies: ReactAppBaseTemplateDependencyMap): Promise<LayerArtifact> {

        const errorPageArtifact = await new CopyTemplateProcessor({
            filePath: "./ErrorPage.tsx",
            templatePath: "./scaffolding/ErrorPage",
            queryExportedObjectName: "ErrorPage"
        }).processTemplate();

        const mainComponentArtifact = await new CopyTemplateProcessor({
            templatePath: "./scaffolding/Main",
            filePath: "./Main.tsx",
            queryExportedObjectName: "Main"
        }).processTemplate();

        const pageTemplateComponentArtifact = await new CopyTemplateProcessor({
            templatePath: "./scaffolding/PageTemplate",
            filePath: "./PageTemplate.tsx",
            queryExportedObjectName: "PageTemplate"
        }).processTemplate();

        const sidebarComponentArtifact = await new SidebarComponentTemplateProcessor({
            filePath: "./Sidebar.tsx",
            templatePath: "./scaffolding/Sidebar"
        }).processTemplate({
            aggregate: undefined!,
            capabilityMap: dependencies.capabilityMap
        });

        const reactAppComponentTemplate: ReactAppBaseTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                artifacts_map: dependencies.capabilityMap,
                import_statements: [...this.getImportStatements(dependencies.capabilityMap)],
                error_component_path: {
                    from: this._filePath,
                    to: errorPageArtifact.filePath
                },
                page_template_component: pageTemplateComponentArtifact.exportedObjectName,
                page_template_component_path: {
                    from: this._filePath,
                    to: pageTemplateComponentArtifact.filePath
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
                pageTemplateComponentArtifact,
                sidebarComponentArtifact
            ]
        }

        return layerArtifact;
    }
}