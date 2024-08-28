// TODO: merge / reduce imports
import { ApplicationGraph, ApplicationGraphNode } from "../../../application-config";
import { CreateInstanceCapability } from "../../../capabilities/create-instance";
import { DeleteInstanceCapability } from "../../../capabilities/delete-instance";
import { DetailCapability } from "../../../capabilities/detail";
import { ListCapability } from "../../../capabilities/list";
import { ListItemCapabilityOptionsGenerator } from "../../../capabilities/template-generators/capability-interface-generator";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateMetadata } from "../../../templates/template-consumer";
import { PresentationLayerDependencyMap } from "../presentation-layer-dependency-map";
import { PresentationLayerTemplateGenerator } from "../presentation-layer-template-generator";
import { ListTableTemplate } from "./list-table-template";

export class ListTableTemplateProcessor extends PresentationLayerTemplateGenerator<ListTableTemplate> {

    strategyIdentifier: string = "list-table-react-generator";
    constructor(templateMetadata: TemplateMetadata) {
        super(templateMetadata);
    }

    private getShortCapabilityName(capabilityId: string): string {
        const map = {
            [ListCapability.identifier]: "list",
            [DetailCapability.identifier]: "detail",
            [CreateInstanceCapability.identifier]: "create-instance",
            [DeleteInstanceCapability.identifier]: "delete-instance"
        };

        const shortName = map[capabilityId];
        if (!shortName) {
            throw new Error("Unsupported capability identifier");
        }

        return shortName;
    }

    private getListTransitions(currentNode: ApplicationGraphNode, graph: ApplicationGraph): string[] {
        const edges = currentNode.getOutgoingEdges(graph);

        const transitionNames = edges.map(edge => {
            const transitionEnd = graph.getNodeByIri(edge.target);

            if (!transitionEnd) {
                throw new Error(`Invalid transition edge: ${edge}`);
            }

            const shortLabel = this.getShortCapabilityName(transitionEnd.getCapabilityInfo().iri);

            return shortLabel;
        });

        return transitionNames;
    }
    
    processTemplate(dependencies: PresentationLayerDependencyMap): LayerArtifact {

        const listItemOptionsArtifact = ListItemCapabilityOptionsGenerator.processTemplate();

        const listTableComponentName: string = `${dependencies.aggregateName}ListTable`;
        const tableTemplate: ListTableTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                presentation_layer_component_name: listTableComponentName,
                list_capability_app_layer: dependencies.appLogicArtifact.exportedObjectName,
                list_app_layer_path: {
                    from: dependencies.pathResolver.getFullSavePath(this._filePath),
                    to: dependencies.appLogicArtifact.filePath
                },
                instance_capability_options: listItemOptionsArtifact.exportedObjectName,
                instance_capability_options_path: {
                    from: this._filePath,
                    to: listItemOptionsArtifact.filePath
                },
                supported_out_list_transitions: this.getListTransitions(dependencies.currentNode, dependencies.graph)
            }
        };

        const presentationLayerRender = this._templateRenderer.renderTemplate(tableTemplate);

        return {
            exportedObjectName: listTableComponentName,
            filePath: this._filePath,
            sourceText: presentationLayerRender,
            dependencies: [listItemOptionsArtifact, dependencies.appLogicArtifact]
        };
    }
}