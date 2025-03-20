import _ from "lodash";
import { ElkConstraintContainer } from "../../configs/constraint-container";
import { Graph } from "../../graph/representation/graph";
import { ElkLayout } from "./elk-layout";
import { ElkNode } from "elkjs";
import { ElkStressProfileLayoutConfiguration } from "../../configs/elk/elk-constraints";
import { Direction } from "../../util/utils";

export class ElkProfileLayout extends ElkLayout {
  prepareFromGraph(graph: Graph, constraintContainer: ElkConstraintContainer): void {
    if(!(constraintContainer.currentLayoutAction.action instanceof ElkStressProfileLayoutConfiguration)) {
      console.error("Incorrect configuration for ElkProfileLayout, can't correctly set initial positions for profile layouting");
      return;
    }
    for(const edge of graph.mainGraph.allEdges) {
      if(edge.edgeProfileType === "CLASS-PROFILE") {
        const profiledClassPosition = edge.end.completeVisualNode.coreVisualNode.position;
        switch(constraintContainer.currentLayoutAction.action.data.preferredProfileDirection){
          case Direction.Up:
            edge.start.completeVisualNode.setPositionInCoreVisualNode(
              profiledClassPosition.x, profiledClassPosition.y - 1000);
            break;
          case Direction.Right:
            edge.start.completeVisualNode.setPositionInCoreVisualNode(
              profiledClassPosition.x + 1000, profiledClassPosition.y);
            break;
          case Direction.Down:
            edge.start.completeVisualNode.setPositionInCoreVisualNode(
              profiledClassPosition.x, profiledClassPosition.y + 1000);
            break;
          case Direction.Left:
            edge.start.completeVisualNode.setPositionInCoreVisualNode(
              profiledClassPosition.x - 1000, profiledClassPosition.y);
            break;
        }
      }
    }
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
