
import { useState } from "react";

import { ModalDialog } from "./modal-dialog";

import { Label, Input, Checkbox, Tab, Tabs } from "./components";

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
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // renderAddModelByUrl
  const [url, setUrl] = useState(DEFAULT_URL);
  const [alias, setAlias] = useState(DEFAULT_NAME);

  // renderAddModelFromPredefined
  const [activeSelection, setActiveSelection] = useState<PredefinedModel[]>([]);

  // renderAddLocalModel
  const [localAlias, setLocalAlias] = useState("");

  const onAdd = () => {
    switch (activeTabIndex) {
      case 0:
        props.onAddModelFromUrl(url, alias);
        break;
      case 1:
        props.onAddPredefinedModel(activeSelection);
        setActiveSelection([]);
        break;
      case 2:
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
        active={activeTabIndex === 0}
        onClick={() => setActiveTabIndex(0)}
      >
        Select model to import
      </Tab>
      <Tab
        active={activeTabIndex === 1}
        onClick={() => setActiveTabIndex(1)}
      >
        Import from URL
      </Tab>
      <Tab
        active={activeTabIndex === 2}
        onClick={() => setActiveTabIndex(2)}
      >
        Create a new local model
      </Tab>
    </Tabs>
    {/* Content. */}
    <div>
      <div className={getTabContentStyle(activeTabIndex === 0)}>
        {renderAddModelByUrl({
          url,
          setUrl,
          alias,
          setAlias
        })}
      </div>
      <div className={getTabContentStyle(activeTabIndex === 1)}>
        {renderAddModelFromPredefined({
          predefinedModels: props.predefinedModels,
          activeSelection,
          toggleSelection: onToggleSelection,
        })}
      </div>
      <div className={getTabContentStyle(activeTabIndex === 2)}>
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
      ✅ Add model(s)
    </button>
    <button
      className="p-2 text-red-700 hover:shadow"
      onClick={props.onCancel}>
      ❌ Cancel
    </button>
  </>;

  return (
    <ModalDialog
      heading="Add model"
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
      <p>
        Import semantic model using given URL.
      </p>
      <br />
      <Label html-for="model-url">Model Turtle file (*.ttl) URL:</Label>
      <Input
        id="model-url"
        type="url"
        pattern="https://.*"
        placeholder="URL"
        value={props.url}
        onChange={(event) => props.setUrl(event.target.value.trim())}
        required
      />
      <Label html-for="model-alias">Model alias:</Label>
      <Input
        id="model-alias"
        type="text"
        placeholder="Alias for your model, you can change this later."
        value={props.alias}
        onChange={(event) => props.setAlias(event.target.value)}
        required
      />
      <br />
      <p className="italic">
        Be warned, that the import is not optimized for large files.
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
        Select models from bellow to import. You can import multiple models at once.
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
        Create new empty local model.
      </p>
      <br />
      <Label html-for="local-alias">Model alias:</Label>
      <Input
        id="local-alias"
        type="text"
        placeholder="Alias for your model, you can change this later."
        value={props.alias}
        onChange={(event) => props.setAlias(event.target.value)}
        required
      />
    </>
  );
}
