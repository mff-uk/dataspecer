import React, {useCallback, useMemo} from "react";
import {useResource} from "@dataspecer/federated-observable-store-react/use-resource";
import {DataPsmAssociationEnd, DataPsmAttribute, DataPsmClass, DataPsmClassReference, DataPsmContainer, DataPsmExternalRoot, DataPsmInclude, DataPsmOr} from "@dataspecer/core/data-psm/model";
import {DraggableProvidedDragHandleProps} from "@hello-pangea/dnd";
import {DataPsmAttributeItem} from "./entities/attribute";
import {DataPsmUnknownItem} from "./entities/unknown";
import {DataPsmAssociationEndItem} from "./entities/association-end";
import {DataPsmClassItem} from "./entities/class";
import {RowSlots} from "./base-row";
import {DataPsmOrItem} from "./entities/or";
import {DataPsmReferenceItem} from "./entities/reference";
import {DataPsmIncludeItem} from "./entities/include";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";
import {WrapWithOr} from "../../operations/wrap-with-or";
import {MenuItem} from "@mui/material";
import {useTranslation} from "react-i18next";
import {DataPsmExternalRootItem} from "./entities/external-root";

/**
 * Context properties for entities as parts of a class.
 */
export interface ClassPartContext {
  /**
   * Owning class
   */
  parentDataPsmClassIri: string;

  // Nearest owning container
  nearestContainerIri: string;

  dragHandleProps?: DraggableProvidedDragHandleProps;
  index?: number;
}

export interface RootContext {
  contextType: "root";
}

export interface ReferenceContext {
  contextType: "reference";
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

  /**
   * Owning class
   */
  parentDataPsmClassIri: string;
}

export type ObjectContext = RootContext | ORContext | IncludeContext | AssociationContext | ReferenceContext;

/**
 * Renders PSM property (attribute, association, or include).
 */
export const DataPsmPropertyType: React.FC<RowSlots & ClassPartContext & {
  iri: string | null,
}> = (props) => {
  const {resource} = useResource(props.iri);

  // Typescript type safety fix
  const typedProps = props as typeof props & {iri: string};

  if (!resource || props.iri === null) {
    return <DataPsmUnknownItem {...props} />
  } else if (DataPsmAttribute.is(resource)) {
    return <DataPsmAttributeItem {...typedProps} />;
  } else if (DataPsmAssociationEnd.is(resource)) {
    return <DataPsmAssociationEndItem {...typedProps} />;
  } else if (DataPsmInclude.is(resource)) {
    return <DataPsmIncludeItem {...typedProps} />;
  } else if (DataPsmContainer.is(resource)) {
    return <DataPsmClassItem {...typedProps} />
  } else {
    return <DataPsmUnknownItem {...typedProps}/>
  }
};

/**
 * Renders objects such as class, class reference and OR
 * @param props
 * @constructor
 */
export const DataPsmObjectType: React.FC<RowSlots & ObjectContext & {
  iri: string | null
}> = (props) => {
  const typedProps = props as typeof props & {iri: string};
  const store = useFederatedObservableStore();
  const {t} = useTranslation("psm");

  const {resource} = useResource(props.iri);

  const canBeWrappedInOR = !DataPsmOr.is(resource) && props.contextType !== "or";

  const wrapWithOr = useCallback(() =>
      store.executeComplexOperation(new WrapWithOr(props.iri!))
    , [store, props.iri]);

  const thisHiddenMenu = useMemo(() => canBeWrappedInOR ? [(close: () => void) => <>
    <MenuItem
      onClick={() => {
        close();
        wrapWithOr();
      }}>
      {t("Wrap with OR")}
    </MenuItem>
  </>] : [], [t, wrapWithOr, canBeWrappedInOR]);

  const hiddenMenu = props.hiddenMenu ? [...thisHiddenMenu, ...props.hiddenMenu] : thisHiddenMenu;

  if (!resource || props.iri === null) {
    return <DataPsmUnknownItem {...props}/>
  } else if ( DataPsmClass.is(resource)) {
    return <DataPsmClassItem {...typedProps} hiddenMenu={hiddenMenu} />;
  } else if ( DataPsmOr.is(resource)) {
    return <DataPsmOrItem {...typedProps} hiddenMenu={hiddenMenu} />;
  } else if ( DataPsmClassReference.is(resource)) {
    return <DataPsmReferenceItem {...typedProps} hiddenMenu={hiddenMenu} />;
  } else if ( DataPsmExternalRoot.is(resource)) {
    return <DataPsmExternalRootItem {...typedProps} hiddenMenu={hiddenMenu} />;
  } else {
    return <DataPsmUnknownItem {...typedProps}/>
  }
};
