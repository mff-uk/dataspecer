import { Badge } from "@/components/ui/badge";
import { LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL, V1 } from "@dataspecer/core-v2/model/known-models";
import { LanguageString } from "@dataspecer/core/core/core-resource";
import { ChevronDown, ChevronRight, Code, Cog, Eye, Folder, Globe2, LibraryBig } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import { ResourcesContext, RootResourcesContext, requestLoadPackage } from "./package";

function lng(text: LanguageString | undefined): string | undefined {
  return text?.["cs"] ?? text?.["en"];
}

const typeToName = {
  [LOCAL_PACKAGE]: "Adresář",
  [LOCAL_VISUAL_MODEL]: "Visuální model",
  [LOCAL_SEMANTIC_MODEL]: "Sémantický model",
  [V1.CIM]: "CIM",
  [V1.PIM]: "PIM",
  [V1.PSM]: "PSM",
  [V1.GENERATOR_CONFIGURATION]: "Konfigurace generátorů",
  "https://dataspecer.com/core/model-descriptor/sgov": "Sémantický slovník pojmů",
  "https://dataspecer.com/core/model-descriptor/pim-store-wrapper": "Wrapper nad PIMem",
};

const Icon = ({ type }: { type: string[] }) => {
  if (type.includes(LOCAL_PACKAGE)) {
    return <Folder className="text-gray-400" />;
  }
  if (type.includes(LOCAL_VISUAL_MODEL)) {
    return <Eye className="text-purple-400" />;
  }
  if (type.includes(LOCAL_SEMANTIC_MODEL)) {
    return <LibraryBig className="text-yellow-400" />;
  }
  if (type.includes(V1.CIM)) {
    return <Globe2 className="text-green-400" />;
  }
  if (type.includes(V1.PIM)) {
    return <LibraryBig className="text-orange-400" />;
  }
  if (type.includes(V1.PSM)) {
    return <Code className="text-red-400" />;
  }
  if (type.includes(V1.GENERATOR_CONFIGURATION)) {
    return <Cog className="text-purple-400" />;
  }
  if (type.includes("https://dataspecer.com/core/model-descriptor/sgov")) {
    return <Globe2 className="text-green-400" />;
  }
  if (type.includes("https://dataspecer.com/core/model-descriptor/pim-store-wrapper")) {
    return <LibraryBig className="text-orange-400" />;
  }
};

const Row = ({ iri, parentIri }: { iri: string, parentIri?: string }) => {
  const resources = useContext(ResourcesContext);
  const resource = resources[iri]!;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = useCallback(async () => {
    requestLoadPackage(iri);
    setIsOpen(true);
  }, [iri]);

  return <li className="first:border-y last:border-none border-b border-gray-200 ">
    <div className="flex items-center space-x-4 transition-all hover:bg-accent">
       {resource.types.includes(LOCAL_PACKAGE) ? <div className="flex"><button onClick={() => isOpen ? setIsOpen(false) : open()}>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button><Folder className="text-gray-400 ml-1" /></div> : <Icon type={resource.types} />}       

      <div className="flex flex-col grow items-start">
        <span className="font-medium">{lng(resource.userMetadata?.label) ?? typeToName[resource.types[0]]}</span>
        <span className="text-sm text-gray-500">
          {lng(resource.userMetadata?.label) === undefined ? resource.iri : typeToName[resource.types[0]]}
          &nbsp;
        </span>
      </div>


      {resource.userMetadata?.tags?.map(tag => <Badge variant="secondary">{tag}</Badge>)}

      {resource.types.includes(V1.PSM) && <Button asChild variant={"ghost"}><a href={import.meta.env.VITE_CME + "/../editor?data-specification=" + encodeURIComponent(parentIri ?? "") + "&data-psm-schema=" + encodeURIComponent(iri)}>Editovat strukturu</a></Button>}
      {resource.types.includes(LOCAL_VISUAL_MODEL) && <Button asChild variant={"ghost"}><a href={import.meta.env.VITE_CME + "/core-v2?package-id=" + encodeURIComponent(parentIri ?? "") + "&view-id=" + encodeURIComponent(iri) }>Otevřít v CME</a></Button>}
      {/* <span className="text-sm text-gray-500">1 day ago</span> */}
    </div>
    {resource?.subResourcesIri?.length && isOpen && <ul className="pl-8">
      {resource?.subResourcesIri?.map(iri => <Row iri={iri} key={iri} parentIri={resource.iri} />)}
    </ul>}
  </li>
};

export default function Component() {
  const rootPackages = useContext(RootResourcesContext);
  const resources = useContext(ResourcesContext);

  return (
    <div>
      {rootPackages.length === 0 && <div>
        {[1, 2, 3].map(() => 
          <div className="my-2 flex">
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

function RootPackage({iri}: {iri: string}) {
  const resources = useContext(ResourcesContext);
  const pckg = resources[iri];

  console.log(pckg);

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

  return <div>
      <h2 className="font-heading mt-12 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight first:mt-0">{pckg.userMetadata?.label?.cs}</h2>
      <ul>
        {pckg.subResourcesIri?.map(iri => <Row iri={iri} parentIri={pckg.iri} />)}
      </ul>
  </div>;
}
