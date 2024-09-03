
import { DialogColoredModelHeaderWithLanguageSelector } from "../../components/dialog/dialog-colored-model-header";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { IriLink } from "../../components/iri-link";
import { ScrollableResourceDetailClickThroughList } from "../../components/scrollable-detail-click-through";
import { DialogProps } from "../dialog-api";
import { DetailClassState, useDetailClassController } from "./detail-class-dialog-controller";
import { t } from "../../application/";
import { getEntityTypeString } from "../../util/detail-utils";

const EditClassDialog = (props: DialogProps<DetailClassState>) => {
  const state = props.state;
  const controller = useDetailClassController(props);

  return (
    <>
      <div className="bg-slate-100">
        <DialogColoredModelHeaderWithLanguageSelector
          activeModel={state.model}
          viewedEntity={state.entity}
          currentLanguage={state.language}
          setCurrentLanguage={controller.setLanguage}
          style="grid md:grid-cols-[20%_80%] md:grid-rows-1 md:py-2 md:pl-8"
        />
        {/* Header. */}
        <div className="grid md:grid-cols-[80%_20%] md:grid-rows-1 md:py-2 md:pl-8">
          <h5 className="text-xl">
            Detail of: <span className="font-semibold">{state.name}</span>
          </h5>
          {state.addToViewDisabled ? null : (
            <button
              className="w-min text-nowrap"
              onClick={controller.addToView}
            >
              Add to view
            </button>
          )}
        </div>
        {/* IRI. */}
        <p className="flex flex-row pl-8 text-gray-500" title={state.iri}>
          <IriLink iri={state.iri} />
          {state.iri}
        </p>
        <div className="grid md:grid-cols-[20%_80%] md:pl-8">
          {/* Profile section. */}
          {state.profiledBy.length === 0 ? null : (
            <DialogDetailRow detailKey={t("entity-detail-dialog.profiled-by")}>
              <ScrollableResourceDetailClickThroughList
                detailDialogLanguage={state.language}
                resources={state.profiledBy}
                onResourceClicked={controller.openResouceDetail}
              />
            </DialogDetailRow>
          )}
          {/* IS-A */}
          {state.specializationOf.length === 0 ? null : (
            <DialogDetailRow detailKey={t("entity-detail-dialog.specialization-of")}>
              <ScrollableResourceDetailClickThroughList
                detailDialogLanguage={state.language}
                resources={state.specializationOf}
                onResourceClicked={controller.openResouceDetail}
              />
            </DialogDetailRow>
          )}
          {state.generalizationOf.length === 0 ? null : (
            <DialogDetailRow detailKey={t("entity-detail-dialog.generalization-of")}>
              <ScrollableResourceDetailClickThroughList
                detailDialogLanguage={state.language}
                resources={state.generalizationOf}
                onResourceClicked={controller.openResouceDetail}
              />
            </DialogDetailRow>
          )}
        </div>
        {/* Details. */}
        <div className="grid gap-y-3 bg-slate-100 md:grid-cols-[20%_80%] md:pl-8">
          <DialogDetailRow detailKey={t("entity-detail-dialog.type")}>
            {getEntityTypeString(state.entity)}
          </DialogDetailRow>
          <DialogDetailRow detailKey={t("entity-detail-dialog.description")}>
            {state.description}
          </DialogDetailRow>
          {/* Attributes. */}
          {state.relationships.length === 0 ? null : (
            <DialogDetailRow detailKey={t("entity-detail-dialog.attributes")}>
              <ScrollableResourceDetailClickThroughList
                detailDialogLanguage={state.language}
                resources={state.relationships}
                onResourceClicked={controller.openResouceDetail}
              />
            </DialogDetailRow>
          )}
        </div>
      </div>
    </>
  );
};