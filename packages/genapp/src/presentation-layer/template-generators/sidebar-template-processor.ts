import { TemplateModel } from "../../engine/templates/template-interfaces.ts";
import { LayerArtifact } from "../../engine/layer-artifact.ts";
import { CapabilityRouteComponentMap } from "../../react-base/react-app-base-generator.ts";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer.ts";

export interface SidebarComponentTemplate extends TemplateModel {
    placeholders: {
        collection_aggregates: { [capabilityPath: string]: string };
    };
}

interface SidebarComponentDependencyMap extends TemplateDependencyMap {
    capabilityMap: CapabilityRouteComponentMap;
}

export class SidebarComponentTemplateProcessor extends TemplateConsumer<SidebarComponentTemplate> {

    private getCollectionCapabilities(capabilityMap: CapabilityRouteComponentMap): { [capabilityPath: string]: string } {
        const collectionCapabilities: { [capabilityPath: string]: string } = {};
        const capabilityLabels = Object.entries(capabilityMap)
            .filter(([_, generatedMetadata]) => generatedMetadata.capability.type === "collection")
            .forEach(([capabilityPath, generatedMetadata]) => {
                const capabilityLabel = `${generatedMetadata.capability.label[0]!.toUpperCase()}${generatedMetadata.capability.label.slice(1)} ${generatedMetadata.props.aggregateName}`;
                collectionCapabilities[capabilityPath] = capabilityLabel;
            });

        console.log(capabilityLabels);

        return collectionCapabilities;
    }

    async processTemplate(dependencies: SidebarComponentDependencyMap): Promise<LayerArtifact> {

        // TODO: integrate application graph -> sidebar displays all "collection" type capabilities (list, create)
        const collectionCapabilityMap = this.getCollectionCapabilities(dependencies.capabilityMap);

        const sidebarTemplate: SidebarComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: { collection_aggregates: collectionCapabilityMap }
        };

        const sidebarComponentRender = this._templateRenderer.renderTemplate(sidebarTemplate);

        const sidebarComponentArtifact: LayerArtifact = {
            exportedObjectName: "Sidebar",
            filePath: this._filePath,
            sourceText: sidebarComponentRender,
            dependencies: []
        }

        return sidebarComponentArtifact;
    }
}