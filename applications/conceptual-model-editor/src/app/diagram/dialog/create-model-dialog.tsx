
import { useState } from "react";

import { ModalDialog } from "./modal-dialog";

import { Label, Input, Checkbox, Tab, Tabs } from "./components";

import { t } from "../application";

const DEFAULT_URL = "https://www.w3.org/ns/dcat.ttl";

const DEFAULT_NAME = "dcat";

export interface PredefinedModel {
  /**
   * Model identifier.
   */
  identifier: string;
  /**
   * Human visible label.
   */
  label: string;
  /**
   * Optional value used as an alias for the model.
   * If missing label is used instead.
   */
  alias?: string;
}

enum TabList {
  AddFromUrl = 0,
  AddPredefined = 1,
  CreateLocal = 2
}

export const AddModelDialog = (props: {
  /**
   * True when dialog is open.
   */
  isOpen: boolean,
  /**
   * List of predefined models to select from.
   */
  predefinedModels: PredefinedModel[],
  /**
   * User wants to close the dialog.
   */
  onCancel: () => void,
  /**
   * Uset wants to add a model using URL and a alias.
   */
  onAddModelFromUrl: (url: string, alias: string) => void,
  /**
   * User wants to add a predefined model.
   */
  onAddPredefinedModel: (models: PredefinedModel[]) => void,
  /**
   * Users wants to add a new local model.
   */
  onAddLocalModel: (alias: string) => void,
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState(TabList.AddFromUrl);

  // renderAddModelByUrl
  const [url, setUrl] = useState(DEFAULT_URL);
  const [alias, setAlias] = useState(DEFAULT_NAME);

  // renderAddModelFromPredefined
  const [activeSelection, setActiveSelection] = useState<PredefinedModel[]>([]);

  // renderAddLocalModel
  const [localAlias, setLocalAlias] = useState("");

  const onAdd = () => {
    switch (activeTabIndex) {
      case TabList.AddFromUrl:
        props.onAddModelFromUrl(url, alias);
        break;
      case TabList.AddPredefined:
        props.onAddPredefinedModel(activeSelection);
        setActiveSelection([]);
        break;
      case TabList.CreateLocal:
        props.onAddLocalModel(localAlias);
        setLocalAlias("");
        break;
    }
  };

  const onToggleSelection = (value: PredefinedModel) => {
    const index = activeSelection.indexOf(value);
    if (index === -1) {
      setActiveSelection([...activeSelection, value]);
    } else {
      setActiveSelection([
        ...activeSelection.slice(0, index),
        ...activeSelection.slice(index + 1),
      ]);
    }
  };

  const content = <>
    <Tabs>
      <Tab
        active={activeTabIndex === TabList.AddFromUrl}
        onClick={() => setActiveTabIndex(TabList.AddFromUrl)}
      >
        {t("add-model-dialog.tab-from-url")}
      </Tab>
      <Tab
        active={activeTabIndex === TabList.AddPredefined}
        onClick={() => setActiveTabIndex(TabList.AddPredefined)}
      >
        {t("add-model-dialog.tab-predefined")}
      </Tab>
      <Tab
        active={activeTabIndex === TabList.CreateLocal}
        onClick={() => setActiveTabIndex(TabList.CreateLocal)}
      >
        {t("add-model-dialog.tab-create")}
      </Tab>
    </Tabs>
    {/* Content. */}
    <div>
      <div className={getTabContentStyle(activeTabIndex === TabList.AddFromUrl)}>
        {renderAddModelByUrl({
          url,
          setUrl,
          alias,
          setAlias
        })}
      </div>
      <div className={getTabContentStyle(activeTabIndex === TabList.AddPredefined)}>
        {renderAddModelFromPredefined({
          predefinedModels: props.predefinedModels,
          activeSelection,
          toggleSelection: onToggleSelection,
        })}
      </div>
      <div className={getTabContentStyle(activeTabIndex === TabList.CreateLocal)}>
        {renderAddLocalModel({
          alias: localAlias,
          setAlias: setLocalAlias,
        })}
      </div>
    </div>
  </>;

  const footer = <>
    <button
      className="p-2 text-green-700 hover:shadow"
      onClick={onAdd}
    >
      {t("add-model-dialog.btn-ok")}
    </button>
    <button
      className="p-2 text-red-700 hover:shadow"
      onClick={props.onCancel}>
      {t("add-model-dialog.btn-cancel")}
    </button>
  </>;

  return (
    <ModalDialog
      heading={t("add-model-dialog.label")}
      isOpen={props.isOpen}
      onCancel={props.onCancel}
      content={content}
      footer={footer}
    />
  );
};

function getTabContentStyle(active: boolean): string {
  const base = "p-4 ";
  return base + (active ? "" : "hidden");
}

function renderAddModelByUrl(props: {
  url: string,
  setUrl: (next: string) => void,
  alias: string,
  setAlias: (next: string) => void,
}) {
  return (
    <>
      <Label html-for="model-url">{t("add-model-dialog.url-label")}</Label>
      <Input
        id="model-url"
        type="url"
        pattern="https://.*"
        placeholder={t("add-model-dialog.url-placeholder")}
        value={props.url}
        onChange={(event) => props.setUrl(event.target.value.trim())}
        required
      />
      <Label html-for="model-alias">{t("add-model-dialog.alias-label")}</Label>
      <Input
        id="model-alias"
        type="text"
        placeholder={t("add-model-dialog.alias-placeholder")}
        value={props.alias}
        onChange={(event) => props.setAlias(event.target.value)}
        required
      />
      <br />
      <p className="italic">
        {t("add-model-dialog.url-size-warning")}
      </p>
    </>
  );
}

function renderAddModelFromPredefined(props: {
  predefinedModels: PredefinedModel[],
  activeSelection: PredefinedModel[],
  toggleSelection: (value: PredefinedModel) => void,
}) {
  return (
    <>
      <p>
        {t("add-model-dialog.tab-predefined.introduction")}
      </p>
      <br />
      <ul>
        {props.predefinedModels.map((item) => (
          <li key={item.identifier} className="flex gap-1 items-center my-2" >
            <Checkbox
              id={item.identifier + "-checkbox"}
              checked={props.activeSelection.includes(item)}
              onChange={() => props.toggleSelection(item)}
            />
            <label
              htmlFor={item.identifier + "-checkbox"}
            >
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

function renderAddLocalModel(props: {
  alias: string,
  setAlias: (next: string) => void,
}) {
  return (
    <>
      <p>
        {t("add-model-dialog.tab-create.introduction")}
      </p>
      <br />
      <Label html-for="local-alias">{t("add-model-dialog.alias-label")}</Label>
      <Input
        id="local-alias"
        type="text"
        placeholder={t("add-model-dialog.alias-placeholder")}
        value={props.alias}
        onChange={(event) => props.setAlias(event.target.value)}
        required
      />
    </>
  );
}
