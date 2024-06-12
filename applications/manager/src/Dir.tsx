import { Badge } from "@/components/ui/badge";
import { API_SPECIFICATION_MODEL, LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL, V1 } from "@dataspecer/core-v2/model/known-models";
import { LanguageString } from "@dataspecer/core/core/core-resource";
import { ChevronDown, ChevronRight, EllipsisVertical, Folder, Pencil, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getValidTime } from "./components/time";
import { Translate } from "./components/translate";
import { Button } from "./components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { Skeleton } from "./components/ui/skeleton";
import { Autolayout } from "./dialog/autolayout";
import { CreateNew } from "./dialog/create-new";
import { DeleteResource } from "./dialog/delete-resource";
import { ProjectWizard } from "./dialog/project-wizard/project-wizard";
import { RenameResourceDialog } from "./dialog/rename-resource";
import { ResourceDetail } from "./dialog/resource-detail";
import { useToggle } from "./hooks/use-toggle";
import { ModelIcon, modelTypeToName } from "./known-models";
import { useBetterModal } from "./lib/better-modal";
import { ResourcesContext, modifyUserMetadata, requestLoadPackage } from "./package";


export function lng(text: LanguageString | undefined): string | undefined {
  return text?.["cs"] ?? text?.["en"];
}

function stopPropagation<E extends React.MouseEvent>(f: ((e: E) => void) | undefined = undefined) {
  return (e: E) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    f?.(e);
  };
}

export function preventDefault<E extends React.SyntheticEvent>(f: ((e: E) => void) | undefined = undefined) {
  return (e: E) => {
    e.preventDefault();
    f?.(e);
  };
}

const Row = ({ iri, parentIri }: { iri: string, parentIri?: string }) => {
  const resources = useContext(ResourcesContext);
  const resource = resources[iri]!;
  const {t} = useTranslation();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = useCallback(async () => {
    requestLoadPackage(iri);
    setIsOpen(true);
  }, [iri]);

  const detailModalToggle = useToggle();

  const openModal = useBetterModal();

  return <li className="first:border-y last:border-none border-b">
    <div className="flex items-center space-x-4 hover:bg-accent">
       {resource.types.includes(LOCAL_PACKAGE) ? <div className="flex"><button onClick={stopPropagation(() => isOpen ? setIsOpen(false) : open())}>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button><Folder className="text-gray-400 ml-1" /></div> : <div><ModelIcon type={resource.types} /></div>}       

      <div className="grow min-w-0">
        <div className="font-medium">
          <Translate
            text={resource.userMetadata?.label}
            match={t => <>{t} <span className="ml-5 text-gray-500 font-normal">{modelTypeToName[resource.types[0]]}</span></>}
            fallback={modelTypeToName[resource.types[0]]}
          />
        </div>
        <div className="text-sm text-gray-500 flex">
          <span className="truncate w-[4cm]">
            {getValidTime(resource.metadata?.creationDate) && t("created", {val: new Date(resource.metadata?.creationDate!)})}
          </span>
          <span className="truncate w-[6cm]">
            {getValidTime(resource.metadata?.modificationDate) && t("changed", {val: new Date(resource.metadata?.modificationDate!)})}
          </span>
          <span className="truncate">
            {resource.iri}
          </span>
        </div>
      </div>

      {resource.userMetadata?.tags?.map(tag => <Badge variant="secondary" key={tag}>{tag}</Badge>)}

      {resource.types.includes(V1.PSM) && <Button asChild variant={"ghost"} onClick={stopPropagation()}><a href={import.meta.env.VITE_CME + "/../editor?data-specification=" + encodeURIComponent(parentIri ?? "") + "&data-psm-schema=" + encodeURIComponent(iri)}>{t("open")}</a></Button>}
      {resource.types.includes(LOCAL_VISUAL_MODEL) && <Button asChild variant={"ghost"} onClick={stopPropagation()}><a href={import.meta.env.VITE_CME + "/diagram?package-id=" + encodeURIComponent(parentIri ?? "") + "&view-id=" + encodeURIComponent(iri) }>{t("open")}</a></Button>}
      {resource.types.includes(API_SPECIFICATION_MODEL) && <Button asChild variant={"ghost"} onClick={stopPropagation()}><a href={import.meta.env.VITE_API_SPECIFICATION_APPLICATION + "?package-iri=" + encodeURIComponent(parentIri ?? "") + "&model-iri=" + encodeURIComponent(iri) }>{t("open")}</a></Button>}

      {resource.types.includes(LOCAL_PACKAGE) &&
        <Button variant="ghost" size="icon" className="shrink-0" onClick={stopPropagation(() => openModal(CreateNew, {iri}))}>
          <Plus className="h-4 w-4" />
        </Button>
      }

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={async () => {
            const result = await openModal(RenameResourceDialog, {inputLabel: resource.userMetadata?.label, inputDescription: resource.userMetadata?.description});
            if (result) {
              await modifyUserMetadata(iri, {label: result.name, description: result.description});
            }
          }}><Pencil className="mr-2 h-4 w-4" /> Rename</DropdownMenuItem>
          {resource.types.includes(LOCAL_SEMANTIC_MODEL) && <DropdownMenuItem onClick={() => openModal(Autolayout, {iri, parentIri: parentIri!})}><Sparkles className="mr-2 h-4 w-4" /> {t("autolayout")}</DropdownMenuItem>}
          <DropdownMenuItem className="bg-destructive text-destructive-foreground hover:bg-destructive" onClick={() => openModal(DeleteResource, {iri})}><Trash2 className="mr-2 h-4 w-4" /> {t("remove")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    {resource?.subResourcesIri?.length && isOpen && <ul className="pl-8">
      {resource?.subResourcesIri?.map(iri => <Row iri={iri} key={iri} parentIri={resource.iri} />)}
    </ul>}
    <ResourceDetail isOpen={detailModalToggle.isOpen} close={detailModalToggle.close} iri={iri} />
  </li>
};

export default function Component() {
  return (
    <div>
      <RootPackage iri={"http://dataspecer.com/packages/local-root"} />
      <RootPackage iri={"http://dataspecer.com/packages/v1"} />
      <RootPackage iri={"https://dataspecer.com/resources/import/lod"} defaultToggle={false} />
    </div>
  )
}

function RootPackage({iri, defaultToggle}: {iri: string, defaultToggle?: boolean}) {
  const openModal = useBetterModal();
  const resources = useContext(ResourcesContext);
  const pckg = resources[iri];
  const {t} = useTranslation();

  // Whether the package is open or not
  const [isOpen, setIsOpen] = useState<boolean>(defaultToggle ?? true);

  useEffect(() => {
    requestLoadPackage(iri);
  }, []);

  if (!pckg) {
    return <div className="my-2 flex">
      <Skeleton className="w-[44px] h-[44px] rounded-full" />
      <div className="ml-3">
        <Skeleton className="w-[200px] h-6 mb-1" />
        <Skeleton className="w-[100px] h-4" />
      </div>
    </div>;
  }

  return <div className="mb-12">
    <div className="flex flex-row">
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      <h2 className="font-heading ml-3 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight first:mt-0 grow">{pckg.userMetadata?.label?.cs}</h2>
      <Button variant="ghost" size={"sm"} className="shrink-0 ml-4" onClick={() => openModal(CreateNew, {iri})}><Folder className="mr-2 h-4 w-4" /> {t("new-package")}</Button>
      <Button variant="default" size={"sm"} className="shrink-0 ml-4" onClick={() => openModal(ProjectWizard, {iri})}><WandSparkles className="mr-2 h-4 w-4" /> {t("project-wizard")}</Button>
    </div>
    {isOpen &&
      <ul>
        {pckg.subResourcesIri?.map(iri => <Row iri={iri} parentIri={pckg.iri} key={iri} />)}
      </ul>
    }
  </div>;
}
