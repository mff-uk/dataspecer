import React, {useCallback, useMemo} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass, DataPsmClassReference, DataPsmInclude, DataPsmOr} from "@dataspecer/core/data-psm/model";
import {DraggableProvidedDragHandleProps} from "react-beautiful-dnd";
import {DataPsmAttributeItem} from "./entities/attribute";
import {DataPsmUnknownItem} from "./entities/unknown";
import {DataPsmAssociationEndItem} from "./entities/association-end";
import {DataPsmClassItem} from "./entities/class";
import {RowSlots} from "./base-row";
import {DataPsmOrItem} from "./entities/or";
import {DataPsmReferenceItem} from "./entities/reference";
import {DataPsmIncludeItem} from "./entities/include";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {DeleteAttribute} from "../../operations/delete-attribute";
import {DataPsmDeleteButton} from "./class/DataPsmDeleteButton";
import {DeleteAssociationClass} from "../../operations/delete-association-class";
import {DeleteInclude} from "../../operations/delete-include";
import {WrapWithOr} from "../../operations/wrap-with-or";
import {MenuItem} from "@mui/material";
import {useTranslation} from "react-i18next";

/**
 * Represents a single row in the bullet list representation. Each row starts with an entity denoted by its IRI. The row
 * itself is in a context. For example, a root entity has a different context than entity that is a part of class
 */
export const DataPsmRootRow: React.FC<{
  iri: string,
}> = (props) => null;

/**
 * Context properties for entities as parts of a class.
 */
export interface ClassPartContext {
  /**
   * Owning class
   */
  parentDataPsmClassIri: string;

  dragHandleProps?: DraggableProvidedDragHandleProps;
  index?: number;
}

export interface RootContext {
  contextType: "root";
}

export interface ORContext {
  contextType: "or";
  parentDataPsmOrIri: string;
}

export interface IncludeContext {
  contextType: "include";
  parentDataPsmIncludeIri: string;
}

export interface AssociationContext {
  contextType: "association";
  parentDataPsmAssociationEndIri: string;
  parentTypePimIri: string;
}

export type ObjectContext = RootContext | ORContext | IncludeContext | AssociationContext;





export const DataPsmPropertyType: React.FC<ClassPartContext & {
  iri: string | null,
}> = (props) => {
  const store = useFederatedObservableStore();
  const {resource} = useResource(props.iri);

  // So far only classes have properties
  const {resource: ownerClass} = useResource<DataPsmClass>(props.parentDataPsmClassIri);

  // Delete property from class
  // todo https://github.com/mff-uk/dataspecer/issues/247
  const deleteAction = useCallback(() => {
    if (!ownerClass || !resource) {
      return
    }

    if (DataPsmAttribute.is(resource)) {
      store.executeComplexOperation(new DeleteAttribute(resource, ownerClass))
    }

    if (DataPsmAssociationEnd.is(resource)) {
      (async () => {
        const pointed = await store.readResource(resource.dataPsmPart as string) as DataPsmClass;
        await store.executeComplexOperation(new DeleteAssociationClass(resource, pointed!, ownerClass.iri!));
      })();
    }

    if (DataPsmInclude.is(resource)) {
      store.executeComplexOperation(new DeleteInclude(resource.iri!, ownerClass.iri!));
    }
  }, [resource, ownerClass, store]);

  const menu = useMemo(() => [<DataPsmDeleteButton onClick={deleteAction} />], [deleteAction]);

  // Type safety fix
  const typedProps = props as typeof props & {iri: string};

  if (!resource || props.iri === null) {
    return <DataPsmUnknownItem {...props}/>
  } else if (DataPsmAttribute.is(resource)) {
    return <DataPsmAttributeItem {...typedProps} menu={menu}/>;
  } else if (DataPsmAssociationEnd.is(resource)) {
    return <DataPsmAssociationEndItem {...typedProps} menu={menu} />;
  } else if (DataPsmInclude.is(resource)) {
    return <DataPsmIncludeItem {...typedProps} menu={menu} />;
  } else {
    return <DataPsmUnknownItem {...typedProps}/>
  }
};

export const DataPsmObjectType: React.FC<RowSlots & {
  iri: string | null,
  context: ObjectContext,
}> = (props) => {
  const typedProps = props as typeof props & {iri: string};
  const store = useFederatedObservableStore();
  const {t} = useTranslation("psm");

  const {resource} = useResource(props.iri);

  const wrapWithOr = useCallback(() =>
      store.executeComplexOperation(new WrapWithOr(props.iri!))
    , [store, props.iri]);

  const thisHiddenMenu = useMemo(() => [(close: () => void) => <>
    <MenuItem
      onClick={() => {
        close();
        wrapWithOr();
      }}>
      {t("Wrap with OR")}
    </MenuItem>
  </>], [wrapWithOr]);

  if (!resource || props.iri === null) {
    return <DataPsmUnknownItem {...props}/>
  } else if ( DataPsmClass.is(resource)) {
    return <DataPsmClassItem {...typedProps} hiddenMenu={thisHiddenMenu} />;
  } else if ( DataPsmOr.is(resource)) {
    return <DataPsmOrItem {...typedProps} hiddenMenu={thisHiddenMenu} />;
  } else if ( DataPsmClassReference.is(resource)) {
    return <DataPsmReferenceItem {...typedProps} hiddenMenu={thisHiddenMenu} />;
  } else {
    return <DataPsmUnknownItem {...typedProps}/>
  }
};
