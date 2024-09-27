import React, { useContext, useMemo } from "react";

import { type InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

import { type DialogApiContextType } from "../dialog/dialog-service";
import { DialogApiContext } from "../dialog/dialog-context";
import { logger } from "../application/";
import { type EditClassState } from "../dialog/class/edit-class-dialog-controller";
import { type ClassesContextType, ClassesContext } from "../context/classes-context";
import { useNotificationServiceWriter } from "../notification/";
import { type UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContext, type ModelGraphContextType } from "../context/model-context";
import { createAddModelDialog } from "../dialog/model/create-model-dialog";
import { type CreateModelState } from "../dialog/model/create-model-dialog-controller";
import { createEditClassDialog } from "../dialog/class/edit-class-dialog";
import { ConfigurationContext, type ConfigurationContextType } from "../context/configuration-context";
import { createVocabulary } from "./create-vocabulary";
import { createClass } from "./create-class";

export interface ActionsContextType {

  /**
   * Open dialog to add a new model.
   */
  openCreateModelDialog: () => void;

  /**
   * Open dialog to create a new class.
   * When position is provided the class is also inserted to the canvas.
   */
  openCreateClassDialog: (model: InMemorySemanticModel) => void;
}

export const ActionContext = React.createContext<ActionsContextType>(createNoOperationActionsContext());

function noOperation() {
  logger.error("Using uninitialized actions context!");
}

function createNoOperationActionsContext(): ActionsContextType {
  return {
    openCreateModelDialog: noOperation,
    openCreateClassDialog: noOperation,
  };
}

export const ActionsContextProvider = (props: {
  children: React.ReactNode,
}) => {
  const options = useContext(ConfigurationContext);
  const dialogs = useContext(DialogApiContext);
  const classes = useContext(ClassesContext);
  const notifications = useNotificationServiceWriter();
  const graph = useContext(ModelGraphContext);

  const actions = useMemo(
    () => createActionsContext(options, dialogs, classes, notifications, graph),
    [options, dialogs, classes, notifications, graph]
  );

  return (
    <ActionContext.Provider value={actions}>
      {props.children}
    </ActionContext.Provider>
  );
};

function createActionsContext(
  options: ConfigurationContextType | null,
  dialogs: DialogApiContextType | null,
  _: ClassesContextType | null,
  notifications: UseNotificationServiceWriterType | null,
  graph: ModelGraphContextType | null,
): ActionsContextType {

  const openCreateModelDialog = () => {
    if (graph === null) {
      console.error("Contexts are not ready.");
      return;
    }

    const onConfirm = (state: CreateModelState) => {
      createVocabulary(graph, state);
    };

    dialogs?.openDialog(createAddModelDialog(onConfirm));
  };

  const openCreateClassDialog = (model: InMemorySemanticModel) => {
    if (options === null || notifications === null || graph === null) {
      console.error("Contexts are not ready.");
      return;
    }

    const onConfirm = (state: EditClassState) => {
      createClass(notifications, graph, model, null, state);
    };

    dialogs?.openDialog(createEditClassDialog(model, options.language, onConfirm));
  };

  return {
    openCreateModelDialog,
    openCreateClassDialog,
  };

}

export const useActions = (): ActionsContextType => {
  return useContext(ActionContext);
};
