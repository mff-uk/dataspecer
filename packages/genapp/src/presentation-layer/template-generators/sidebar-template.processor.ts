import { TemplateDescription } from "../../engine/eta-template-renderer";
import { LayerArtifact } from "../../engine/layer-artifact";
import { AggregateCapabilitiesReactRouteComponentsMap, ReactRouteComponentDescription } from "../../engine/react-app-base-generator";
import { TemplateConsumer, TemplateDependencyMap } from "../../templates/template-consumer";

export interface SidebarComponentTemplate extends TemplateDescription {
    placeholders: {
        aggregates_with_list: { [aggregateName: string]: ReactRouteComponentDescription };
    };
}

interface SidebarComponentDependencyMap extends TemplateDependencyMap {
    aggregateCapabilitiesMap: AggregateCapabilitiesReactRouteComponentsMap;
}

export class SidebarComponentTemplateProcessor extends TemplateConsumer<SidebarComponentTemplate> {

    private getAggregateNamesWithListCapability(aggregateCapabilitiesMap: AggregateCapabilitiesReactRouteComponentsMap): 
        { [aggregateName: string]: ReactRouteComponentDescription } {
        
        const result: { [aggregateName: string]: ReactRouteComponentDescription } = {};
        Object.keys(aggregateCapabilitiesMap)
            .filter(aggregateName => {
                const capabilityComponentDescriptorMap = aggregateCapabilitiesMap[aggregateName]!;
                return "list" in capabilityComponentDescriptorMap;
            })
            .forEach(aggregateName => {
                const aggregateListComponent = aggregateCapabilitiesMap[aggregateName]!.list!;
                result[aggregateName] = aggregateListComponent;
            });

        console.log(result);

        return result;
    }
    
    processTemplate(dependencies: SidebarComponentDependencyMap): LayerArtifact {
        
        const aggregateNames = this.getAggregateNamesWithListCapability(dependencies.aggregateCapabilitiesMap);

        const sidebarTemplate: SidebarComponentTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregates_with_list: aggregateNames
            }
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