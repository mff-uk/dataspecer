import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

type ButtonData = {
  callback: (value: string) => void;
  content: string
}

type ButtonDataForCatalogItem = {
  callback: () => void;
  content: string
}

const CatalogItem = (
  props: {
    value: string; onValueSelected: () => void;
    withDeleteButton?: () => void;
    withSpecialButtons?: ButtonDataForCatalogItem[];
  }
) => {
  const { value, onValueSelected, withDeleteButton, withSpecialButtons } = props;
  return (
    <li key={value} className="flex w-full flex-row justify-between">
      <button id={`button-dropdown-catalog-${value}`} className="flex-grow" onClick={onValueSelected}>
        {value}
      </button>
      {withDeleteButton && (
        <button id={`button-dropdown-catalog-${value}-delete`} onClick={withDeleteButton}>
                    🗑
        </button>
      )}
      {withSpecialButtons && withSpecialButtons.map(({content, callback}, index) =>
        (<button key={`button-dropdown-catalog-${value}-${index}-special`}
          id={`button-dropdown-catalog-${value}-${index}-special`}
          onClick={callback}>
          {content}
        </button>))
      }
    </li>
  );
};

const key = (value: string | [string, string]) => {
  if (Array.isArray(value)) {
    return value[0];
  } else {
    return value;
  }
};

const val = (value: string | [string, string]) => {
  if (Array.isArray(value)) {
    return value[1];
  } else {
    return value;
  }
};

export const DropDownCatalog = (props: {
    label: string;
    valueSelected: string | null;
    availableValues: readonly string[] | readonly [string, string][]; // [key, value]
    openCatalogTitle?: string;
    onValueSelected: (value: string) => void;
    specialButtons?: ButtonData[];
    onValueDeleted?: (value: string) => void;
    children?: ReactNode;
}) => {
  const {
    label: catalogName, valueSelected, availableValues, openCatalogTitle,
    onValueSelected, specialButtons, onValueDeleted, children
  } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (dropdownOpen && dropdownRef.current) {
      dropdownRef.current?.focus();
    }
  }, [dropdownOpen]);

  const valueSelectedVal = useMemo(() => {
    return val(availableValues.find((v) => key(v) === valueSelected) ?? "---");
  }, [valueSelected, availableValues]);

  return (
    <div className="my-auto">
      <div className="flex flex-col text-[15px]">
        <div className="relative flex flex-row flex-wrap md:flex-nowrap">
          <div className="text-nowrap">
            {catalogName}:
            <span className="ml-2 max-w-40 overflow-x-clip text-wrap font-mono">
              {valueSelectedVal ?? "---"}
            </span>
          </div>
          <button
            className="white ml-2 text-[15px]"
            title={openCatalogTitle}
            onClick={() => setDropdownOpen(true)}
          >
            🗃️
          </button>
          {children}
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              tabIndex={-1}
              className="absolute z-10 mt-8 flex w-full flex-col bg-[#5438dc]"
              onBlur={(e) => {
                if (e.relatedTarget?.id.startsWith("button-dropdown-catalog-")) {
                  return;
                }
                setDropdownOpen(false);
                e.stopPropagation();
              }}
            >
              <ul className="w-full">
                {availableValues.map((value) => (
                  <CatalogItem
                    key={key(value)}
                    value={val(value)}
                    onValueSelected={() => {
                      setDropdownOpen(false);
                      onValueSelected(key(value));
                    }}
                    withDeleteButton={
                      onValueDeleted
                        ? () => {
                          setDropdownOpen(false);
                          onValueDeleted(key(value));
                        }
                        : undefined
                    }
                    withSpecialButtons={value?.[0] === valueSelected ? undefined : specialButtons?.map(buttonData => ({
                      content: buttonData.content,
                      callback: () => {
                        setDropdownOpen(false);
                        buttonData.callback(key(value));
                      }
                    }))}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
