import _ from "lodash";
import { ElkConstraintContainer } from "../../configs/constraint-container";
import { Graph } from "../../graph/representation/graph";
import { ElkLayout } from "./elk-layout";
import { ElkNode } from "elkjs";
import { ElkStressProfileLayoutConfiguration } from "../../configs/elk/elk-constraints";

export class ElkProfileLayout extends ElkLayout {
  prepareFromGraph(graph: Graph, constraintContainer: ElkConstraintContainer): void {
    super.prepareFromGraph(graph, constraintContainer);
    this.setProfileLengthsForEdges();
  };
  async run(shouldCreateNewGraph: boolean) {
    return super.run(shouldCreateNewGraph);
  };
  runGeneralizationLayout(shouldCreateNewGraph: boolean) {
    return super.runGeneralizationLayout(shouldCreateNewGraph);
  };

  setProfileLengthsForEdges() {
    if(!(this.constraintContainer.currentLayoutAction.action instanceof ElkStressProfileLayoutConfiguration)) {
      console.error("Incorrect configuration for ElkProfileLayout, can't correctly set profile edge lengths");
      return;
    }
    const profileEdgeLength = this.constraintContainer.currentLayoutAction.action.data.profileEdgeLength;
    this.setProfileLengthsForEdgesInternal(this.graphInElk, profileEdgeLength);
  }

  setProfileLengthsForEdgesInternal(graphInElk: ElkNode, profileEdgeLength: number) {
    graphInElk?.edges?.forEach(edge => {
      const graphEdge = this.graph.mainGraph.findEdgeInAllEdges(edge.id);
      if(graphEdge.edgeProfileType === "CLASS-PROFILE") {
        edge.layoutOptions = {
          ...edge.layoutOptions,
          desiredEdgeLength: profileEdgeLength.toString(),
        }
      }
    });
    graphInElk?.children?.forEach(child => {
      this.setProfileLengthsForEdgesInternal(child, profileEdgeLength);
    });
  }
}
