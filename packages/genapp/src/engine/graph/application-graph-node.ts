import { AggregateMetadata } from "../../application-config";
import DalApi from "../../data-layer/dal-generator-api";
import { ApplicationGraphEdge } from "./application-graph-edge";
import { ApplicationGraph } from "./application-graph";
import { LanguageString } from "@dataspecer/core/core";
import { DETAIL_CAPABILITY_ID, EDIT_CAPABILITY_ID } from "../../capabilities";

/**
 * Base node configuration. Maps any object to a named key, which
 * may be further accessed by derived types specific for each
 * capability.
 *
 * @property starting: Optional flag to indicate whether a link to node (i.e. data-structure / capability pair) should be shown
 *  within application sidebar.
 * @property pageTitle: Optional, customizable, language-specific title, which will be shown on capability screen.
 *  Corresponds to a "language": "title" mapping.
 *
 * @see {@link ListNodeConfiguration } for capability specific configuration extensions.
 */
export type NodeConfiguration = {
    starting?: boolean,
    pageTitle?: LanguageString,
} & Record<string, any>;

export type ListNodeConfiguration = {
    showHeader?: boolean;
} & NodeConfiguration;

export type DetailNodeConfiguration = NodeConfiguration;

/**
 * Describes an application graph node. Each instance of application
 * graph node represents a unit of the generated application, i.e. a functional
 * unit, through which application users fulfill their needs.
 */
export type ApplicationGraphNodeType = {
    /**
     * @property iri: Unique identification of an application node.
     * @example "https://example.org/application_graph/nodes/1"
     */
    iri: string;

    /**
     * @property label: Custom, user-defined node name. Label is defined as a mapping between language and the label itself.
     * @example { "en": "Custom node name" }
     */
    label: LanguageString;

    /**
     * @property structure: IRI of a Dataspecer data structure that this node instance referes to.
     * Represents the subject on which an capability (action) will be performed.
     */
    structure: string;

    /**
     * @property capability: IRI of a supported capability (action) to be performed on a data structure.
     * @example "https://dataspecer.com/application_graph/<capability_identifier>"
     */
    capability: string;

    /**
     * @property config: Custom configuration of a node
     * @see {@link NodeConfiguration} for more details
     */
    config: NodeConfiguration;
}

/**
 * An application graph node. Extends the {@link ApplicationGraphNodeType} by adding instance-specific methods.
 */
export class ApplicationGraphNode {
    protected readonly _node: ApplicationGraphNodeType;
    protected readonly _specificationIri: string;

    constructor(specificationIri: string, node: ApplicationGraphNodeType) {
        this._node = node;
        this._specificationIri = specificationIri;
    }

    public getIri() {
        return this._node.iri;
    }

    public getNodeLabel(languageKey?: string): string | undefined {

        const labels = this._node.label;
        if (!labels ||
            Object.keys(labels).length === 0) {
            return undefined;
        }

        if (!languageKey || !(languageKey in labels)) {
            // take first value
            return Object.values(labels).at(0)!;
        }

        return labels[languageKey]!;
    }

    public getCapabilityInfo() {
        return {
            iri: this._node.capability,
            config: this._node.config
        };
    }

    public getStructureIri() {
        return this._node.structure;
    }

    public async getNodeDataStructure(): Promise<AggregateMetadata> {

        const dataStructure = await new DalApi()
            .getStructureInfo(
                this._specificationIri,
                this._node.structure
            );

        return new AggregateMetadata(this._specificationIri, dataStructure);
    }

    public getOutgoingEdges(graph: ApplicationGraph): ApplicationGraphEdge[] {
        return graph
            .edges
            .filter(edge => edge.source === this._node.iri);
    }

    public getIncomingEdges(graph: ApplicationGraph): ApplicationGraphEdge[] {
        return graph
            .edges
            .filter(edge => edge.target === this._node.iri);
    }

    public getDatasource(graph: ApplicationGraph) {
        let datasource = graph.datasources.at(0);

        if (!datasource) {
            throw new Error("Must contain at least 1 datasource");
        }

        return datasource;
    }

    public generateParentNodes(nodes: ApplicationGraphNodeType[]): ApplicationGraphNode[] {
        return [] as ApplicationGraphNode[];
    }
}

class EditCapabilityApplicationGraphNode extends ApplicationGraphNode {
    override generateParentNodes(nodes: ApplicationGraphNodeType[]): ApplicationGraphNode[] {

        const currentNodeIndex = nodes.findIndex(node => node.iri === this._node.iri);

        const detailNodeIndex = nodes.findIndex(node =>
            // a different graph node
            this._node.iri != node.iri &&
            // for same structure model as current node (i.e. edit capability node)
            this._node.structure == node.structure &&
            // which generates "detail" capability
            node.capability === DETAIL_CAPABILITY_ID
        );

        if (detailNodeIndex === -1) {
            // detail capability for given structure model does not exist; insert into graph
            const insertDetailCapabilityNode: ApplicationGraphNodeType = {
                // derive iri from edit capability iri
                iri: `${this._node.iri}/detail`,
                structure: this._node.structure,
                capability: DETAIL_CAPABILITY_ID,
                config: {},
                label: {}
            }

            return [ApplicationGraphNodeFactory.createNodeInstance(this._specificationIri, insertDetailCapabilityNode)];
        }

        // detail capability for given structure model exists:
        if (detailNodeIndex > currentNodeIndex) {
            // later -> move this node to be generated earlier
            const upshiftedNode = nodes.at(detailNodeIndex)!;
            return [ApplicationGraphNodeFactory.createNodeInstance(this._specificationIri, upshiftedNode)];
        }

        // earlier -> don't change anything
        return [];
    }
}

export class ApplicationGraphNodeFactory {
    static createNodeInstance(specificationIri: string, node: ApplicationGraphNodeType) {
        switch (node.capability) {
            case EDIT_CAPABILITY_ID:
                return new EditCapabilityApplicationGraphNode(specificationIri, node);
            default:
                return new ApplicationGraphNode(specificationIri, node);
        }
    }
}