import { Badge } from "@/components/ui/badge";
import { API_SPECIFICATION_MODEL, LOCAL_PACKAGE, LOCAL_VISUAL_MODEL, V1 } from "@dataspecer/core-v2/model/known-models";
import { LanguageString } from "@dataspecer/core/core/core-resource";
import { ChevronDown, ChevronRight, Folder, Plus } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Time, getValidTime } from "./components/time";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import { CreateNew } from "./dialog/create-new";
import { ResourceDetail } from "./dialog/resource-detail";
import { useIsMobile } from "./hooks/use-is-mobile";
import { useToggle } from "./hooks/use-toggle";
import { ModelIcon, modelTypeToName } from "./known-models";
import { ResourcesContext, RootResourcesContext, requestLoadPackage } from "./package";


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

const Row = ({ iri, parentIri }: { iri: string, parentIri?: string }) => {
  const resources = useContext(ResourcesContext);
  const resource = resources[iri]!;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = useCallback(async () => {
    requestLoadPackage(iri);
    setIsOpen(true);
  }, [iri]);

  const isMobile = useIsMobile();
  const detailModalToggle = useToggle();

  const createNew = useContext(createNewContext);

  return <li className="first:border-y last:border-none border-b border-gray-200">
    <div className="flex items-center space-x-4 transition-all hover:bg-accent" onClick={isMobile ? detailModalToggle.open : undefined}>
       {resource.types.includes(LOCAL_PACKAGE) ? <div className="flex"><button onClick={stopPropagation(() => isOpen ? setIsOpen(false) : open())}>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button><Folder className="text-gray-400 ml-1" /></div> : <div><ModelIcon type={resource.types} /></div>}       

      <div className="grow min-w-0">
        <div className="font-medium">{lng(resource.userMetadata?.label) ?? modelTypeToName[resource.types[0]]}</div>
        <div className="text-sm text-gray-500 flex space-x-3">
          {getValidTime(resource.metadata?.creationDate) && <span className="truncate">
            Vytvořeno <Time time={resource.metadata?.creationDate} />  
          </span>}
          {getValidTime(resource.metadata?.modificationDate) && <span className="truncate">
            Změněno <Time time={resource.metadata?.modificationDate} />  
          </span>}
          <span className="truncate">
            {lng(resource.userMetadata?.label) === undefined ? resource.iri : modelTypeToName[resource.types[0]]}
          </span>
        </div>
      </div>

      {resource.userMetadata?.tags?.map(tag => <Badge variant="secondary" key={tag}>{tag}</Badge>)}

      {/* <RenameResourceDialog /> */}

      {resource.types.includes(V1.PSM) && <Button asChild variant={"ghost"} onClick={stopPropagation()}><a href={import.meta.env.VITE_CME + "/../editor?data-specification=" + encodeURIComponent(parentIri ?? "") + "&data-psm-schema=" + encodeURIComponent(iri)}>Editovat strukturu</a></Button>}
      {resource.types.includes(LOCAL_VISUAL_MODEL) && <Button asChild variant={"ghost"} onClick={stopPropagation()}><a href={import.meta.env.VITE_CME + "/core-v2?package-id=" + encodeURIComponent(parentIri ?? "") + "&view-id=" + encodeURIComponent(iri) }>Otevřít v CME</a></Button>}
      {resource.types.includes(API_SPECIFICATION_MODEL) && <Button asChild variant={"ghost"} onClick={stopPropagation()}><a href={import.meta.env.VITE_API_SPECIFICATION_APPLICATION + "package-iri=" + encodeURIComponent(parentIri ?? "") + "&model-iri=" + encodeURIComponent(iri) }>Edit</a></Button>}

      {resource.types.includes(LOCAL_PACKAGE) &&
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => createNew(iri)}>
          <Plus className="h-4 w-4" />
        </Button>
      }

      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem className="bg-destructive text-destructive-foreground hover:bg-destructive/90"><Trash2 className="mr-2 h-4 w-4" /> Odstranit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
    {resource?.subResourcesIri?.length && isOpen && <ul className="pl-8">
      {resource?.subResourcesIri?.map(iri => <Row iri={iri} key={iri} parentIri={resource.iri} />)}
    </ul>}
    <ResourceDetail isOpen={detailModalToggle.isOpen} close={detailModalToggle.close} iri={iri} />
  </li>
};

export default function Component() {
  const rootPackages = useContext(RootResourcesContext);

  return (
    <div>
      {rootPackages.length === 0 && <div>
        {[1, 2, 3].map((i) => 
          <div className="my-2 flex" key={i}>
            <Skeleton className="w-[44px] h-[44px] rounded-full" />
            <div className="ml-3">
              <Skeleton className="w-[200px] h-6 mb-1" />
              <Skeleton className="w-[100px] h-4" />
            </div>
          </div>
        )}
      </div>}

      {rootPackages.map(rootIri => <RootPackage iri={rootIri} key={rootIri} />)}
    </div>
  )
}

const createNewContext = createContext<(parentIri: string) => void>(null as any);

function RootPackage({iri}: {iri: string}) {
  const resources = useContext(ResourcesContext);
  const pckg = resources[iri];

  useEffect(() => {
    requestLoadPackage(iri);
  }, []);

  const createNewToggle = useToggle();
  const [forIri, setForIri] = useState<string>(iri);
  const createNew = useCallback((parentIri: string) => {
    setForIri(parentIri);
    createNewToggle.open();
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

  return <div>
    <div className="flex flex-row">
      <h2 className="font-heading mt-12 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight first:mt-0 grow">{pckg.userMetadata?.label?.cs}</h2>
      <Button variant="default" size={"sm"} className="shrink-0 ml-4" onClick={() => createNew(iri)}><Folder className="mr-2 h-4 w-4" /> New pakckage</Button>
    </div>
    <createNewContext.Provider value={createNew}>
      <ul>
        {pckg.subResourcesIri?.map(iri => <Row iri={iri} parentIri={pckg.iri} key={iri} />)}
      </ul>
    </createNewContext.Provider>

    <CreateNew isOpen={createNewToggle.isOpen} close={createNewToggle.close} iri={forIri} />
  </div>;
}
