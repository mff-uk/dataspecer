import { TemplateModel } from "../../engine/templates/template-interfaces";
import { LayerArtifact } from "../../engine/layer-artifact";
import { CapabilityRouteComponentMap } from "../../react-base/react-app-base-generator";
import { TemplateConsumer, TemplateDependencyMap } from "../../engine/templates/template-consumer";

export interface SidebarComponentTemplate extends TemplateModel {
    placeholders: {
        collection_aggregates: { [capabilityPath: string]: string };
    };
}

interface SidebarComponentDependencyMap extends TemplateDependencyMap {
    capabilityMap: CapabilityRouteComponentMap;
}

/**
 * This class is responsible for the extraction of collection capabilities and their conversion into
 * a format suitable for sidebar navigation rendering. Finally, this class provides a method to populate
 * and render the sidebar UI component template.
 *
 * @extends TemplateConsumer<SidebarComponentTemplate>
 */
export class SidebarComponentTemplateProcessor extends TemplateConsumer<SidebarComponentTemplate> {

    /**
     * Extracts collection capabilities from a the component map and generates labeled paths.
     *
     * @param capabilityMap - Map of capability routes to their additional information.
     * @returns An object which maps capability paths to their formatted labels.
     */
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

    /**
     * Processes and renders the React component template for the sidebar UI component.
     * To generate the component correctly, it uses the list of capabilities to be included within the sidebar.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the artifact which contains generated React component for the sidebar.
     */
    async processTemplate(dependencies: SidebarComponentDependencyMap): Promise<LayerArtifact> {

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