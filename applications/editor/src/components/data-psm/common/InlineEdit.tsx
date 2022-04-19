import React, {memo, useState} from "react";
import {DataPsmAttribute, DataPsmResource} from "@dataspecer/core/data-psm/model";
import {useTranslation} from "react-i18next";
import {useItemStyles} from "../PsmItemCommon";
import {Button, InputBase} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {SetTechnicalLabel} from "../../../operations/set-technical-label";
import {SetDataPsmDatatype} from "../../../operations/set-data-psm-datatype";
import {useFederatedObservableStore} from "@dataspecer/federated-observable-store-react/store";

function emptyStringToNull(value: string | null) {
    return value === "" ? null : value;
}

/**
 * Renders inline form to edit technical label and datatype optionally
 */
export const InlineEdit: React.FC<{close: () => void, dataPsmResource: DataPsmResource, resourceType: "attribute" | "associationEnd"}> = memo(({close, dataPsmResource, resourceType}) => {
  const dataPsmAttribute = dataPsmResource as DataPsmAttribute;

  const store = useFederatedObservableStore();

  const {t} = useTranslation("psm");
  const styles = useItemStyles();

  const [label, setLabel] = useState(dataPsmResource.dataPsmTechnicalLabel ?? "");
  const [datatype, setDatatype] = useState(resourceType === "attribute" ? (dataPsmAttribute.dataPsmDatatype ?? "") : "");

  const process = async () => {
    if (label !== dataPsmResource.dataPsmTechnicalLabel) {
      await store.executeComplexOperation(new SetTechnicalLabel(dataPsmResource.iri as string, label));
    }
    if (resourceType === "attribute" && emptyStringToNull(datatype) !== dataPsmAttribute.dataPsmDatatype) {
      await store.executeComplexOperation(new SetDataPsmDatatype(dataPsmResource.iri as string, emptyStringToNull(datatype)));
    }
    close();
  };

  const keyDown = async (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await process();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  const blur: React.FocusEventHandler<HTMLSpanElement> = (event: React.FocusEvent<HTMLSpanElement>) => {
    const rootElement = event.currentTarget;
    window.requestAnimationFrame(() => {
      if (!rootElement.contains(document.activeElement)) {
        close();
      }
    });
  }

  const className = resourceType === "attribute" ? styles.attributeInlineEditForm : styles.associationInlineEditForm;

  return <span onBlur={blur}>
    <InputBase
        placeholder={t("technical label")}
        className={className}
        autoFocus
        onFocus={e => e.target.select()}
        value={label}
        onChange={event => setLabel(event.target.value)}
        onKeyDown={keyDown}
    />
    {resourceType === "attribute" && <>
      {":"}
      <InputBase
          placeholder={t("datatype")}
          className={className}
          onFocus={e => e.target.select()}
          value={datatype}
          onChange={event => setDatatype(event.target.value)}
          onKeyDown={keyDown}
      />
    </>}
    <Button size="small" onClick={process} startIcon={<CheckIcon/>}>{t("button inline save")}</Button>
    <Button size="small" onClick={close} startIcon={<CloseIcon/>}>{t("button inline discard")}</Button>
  </span>;
});
