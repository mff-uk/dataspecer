import {
  DiagramActions,
  DiagramCallbacks,
  Group,
  GroupWithContent,
  Node,
  Edge,
  Position,
  ViewportDimensions
} from "../../diagram";
import { UseDiagramType } from "../../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../../notification/notification-service-context";

/**
 * This class contains most of the relevant methods needed for testing of actions.
 * That is handling of creation of elements and models.
 * However it is very basic and can be extended
 */
export class ActionsTestSuite {
  /**
   *
   * @param diagramActionsSpecifiedByUser specify some actions as user needs for the tested code
   * @returns Returns diagram with most actions throwing error.
   * But some methods do have legitimate implementation.
   */
  static createTestDiagram(diagramActionsSpecifiedByUser?: Partial<DiagramActions>) {
    const diagram: UseDiagramType = {
      areActionsReady: false,
      actions: function (): DiagramActions {
        const diagramActions: DiagramActions = {
          getGroups: function (): Group[] {
            throw new Error("Function not implemented.");
          },
          addGroups: function (_groups: GroupWithContent[], _hideAddedTopLevelGroups: boolean): void {
            throw new Error("Function not implemented.");
          },
          removeGroups: function (_groups: string[]): void {
            throw new Error("Function not implemented.");
          },
          setGroup: function (_group: Group, _content: string[]): void {
            throw new Error("Function not implemented.");
          },
          getGroupContent: function (_group: Group): string[] {
            throw new Error("Function not implemented.");
          },
          getNodes: function (): Node[] {
            throw new Error("Function not implemented.");
          },
          addNodes: function (_nodes: Node[]): void {
            throw new Error("Function not implemented.");
          },
          updateNodes: function (_nodes: Node[]): void {
            throw new Error("Function not implemented.");
          },
          updateNodesPosition: function (_nodes: { [identifier: string]: Position; }): void {
            throw new Error("Function not implemented.");
          },
          removeNodes: function (_identifiers: string[]): void {
            throw new Error("Function not implemented.");
          },
          getNodeWidth: function (_identifier: string): number | null {
            return 200;
          },
          getNodeHeight: function (_identifier: string): number | null {
            return 100;
          },
          getEdges: function (): Edge[] {
            throw new Error("Function not implemented.");
          },
          addEdges: function (_edges: Edge[]): void {
            throw new Error("Function not implemented.");
          },
          updateEdges: function (_edges: Edge[]): void {
            throw new Error("Function not implemented.");
          },
          setEdgesWaypointPosition: function (_positions: { [identifier: string]: Position[]; }): void {
            throw new Error("Function not implemented.");
          },
          removeEdges: function (_identifiers: string[]): void {
            throw new Error("Function not implemented.");
          },
          getSelectedNodes: function (): Node[] {
            throw new Error("Function not implemented.");
          },
          setSelectedNodes: function (_selectedNodes: string[]): void {
            throw new Error("Function not implemented.");
          },
          getSelectedEdges: function (): Edge[] {
            throw new Error("Function not implemented.");
          },
          setSelectedEdges: function (_edges: string[]): void {
            throw new Error("Function not implemented.");
          },
          setContent: function (_nodes: Node[], _edges: Edge[], _groups: GroupWithContent[]): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getViewport: function (): ViewportDimensions {
            return {
              position: { x: 0, y: 0 },
              width: 100,
              height: 100,
            };
          },
          setViewportToPosition: function (_x: number, _y: number): void {
            throw new Error("Function not implemented.");
          },
          centerViewportToNode: function (_identifier: string): void {
            throw new Error("Function not implemented.");
          },
          fitToView: function (_identifiers: string[]): void {
            throw new Error("Function not implemented.");
          },
          renderToSvgString: function (): Promise<string | null> {
            throw new Error("Function not implemented.");
          },
          openDragEdgeToCanvasMenu: function (_sourceNode: Node, _canvasPosition: Position): void {
            throw new Error("Function not implemented.");
          },
          openSelectionActionsMenu: function (_sourceNode: Node, _canvasPosition: Position): void {
            throw new Error("Function not implemented.");
          },
          openGroupMenu: function (_groupIdentifier: string, _canvasPosition: Position): void {
            throw new Error("Function not implemented.");
          },
          highlightNodesInExplorationModeFromCatalog: function (
            _nodeIdentifiers: string[],
            _modelOfClassWhichStartedHighlighting: string
          ): void {
            throw new Error("Function not implemented.");
          }
        }

        if(diagramActionsSpecifiedByUser !== undefined) {
          return {
            ...diagramActions,
            ...diagramActionsSpecifiedByUser
          };
        }
        return {
          ...diagramActions,
        };
      },
      setActions: function (_nextActions: DiagramActions): void {
        throw new Error("Function not implemented.");
      },
      callbacks: function (): DiagramCallbacks {
        throw new Error("Function not implemented.");
      },
      setCallbacks: function (_nextCallbacks: DiagramCallbacks): void {
        throw new Error("Function not implemented.");
      }
    };

    return diagram;
  }

}

// TODO RadStr: Put into class - and rewrite it as function which returns the notification object.
export const notificationMockup: UseNotificationServiceWriterType = {
  success: () => { },
  error: () => { },
};
