import { Badge } from "@/components/ui/badge"
import { Button } from "./components/ui/button";
import { usePackage } from "./package";
import { Skeleton } from "./components/ui/skeleton";
import { ChevronDown, ChevronRight, Eye, Folder, Globe2, LibraryBig, ListTree } from "lucide-react";
import { useCallback, useState } from "react";

interface StructureNode {
  type: "folder" | "file" | "ds" | "cim" | "pim" | "psm" | "visual";
  name: string;
  tags: string[];
  children: StructureNode[];
  id?: string;
}

const Row = ({ structure }: { structure: StructureNode }) => {
  const [models, setModels] = useState<any[] | null>(null);

  const open = useCallback(async () => {
    const result = await fetch("https://backend.dataspecer.com/packages/semantic-models?packageId=" + structure.id);
    const data = await result.json();

    const models = data.map((item: any) => {
      if (item.type === "https://dataspecer.com/core/model-descriptor/sgov") {
        return {
          type: "cim",
          name: "slovník.gov.cz",
          tags: [],
          children: [],
        }
      } else if (item.type === "https://dataspecer.com/core/model-descriptor/in-memory-semantic-model") {
        return {
          type: "pim",
          name: "Konceptuální model",
          tags: [],
          children: [],
        }
      } else if (item.type === "https://dataspecer.com/core/model-descriptor/visual-model") {
        return {
          type: "visual",
          name: "Diagram",
          tags: [],
          children: [],
        }
      } else {
        return {
          type: "file",
          name: "Model",
          tags: [],
          children: [],
        }
      }
    });

    setModels(models);
  }, []);

  return <li className="first:border-y last:border-none border-b border-gray-200 ">
    <div className="flex items-center space-x-4 transition-all hover:bg-accent">
      {structure.type === "ds" ? <div className="flex"><button onClick={() => models ? setModels(null) : open()}>
        {models ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button><Folder className="text-blue-400 ml-1" /></div> : null}

      {structure.type === "folder" ? <Folder className="text-gray-400" /> : null}
      {structure.type === "psm" ? <ListTree className="text-red-400" /> : null}
      {structure.type === "pim" ? <LibraryBig className="text-yellow-400" /> : null}
      {structure.type === "cim" ? <Globe2 className="text-green-400" /> : null}
      {structure.type === "visual" ? <Eye className="text-purple-400" /> : null}
      <div className="flex flex-col grow items-start">
        <span className="font-medium">{structure.name ?? "unnamed package"}</span>
        <span className="text-sm text-gray-500">
          {structure.type === "ds" ? "Data specification" : null}
          {structure.type === "folder" ? "Directory" : null}
          {structure.type === "psm" ? "PSM v.1" : null}
          {/* {structure.type === "pim" ? "PIM v.1" : null} */}
          {structure.type === "cim" ? "External conceptual model" : null}
          &nbsp;
        </span>
      </div>
      {structure.tags.map(tag => <Badge variant="secondary">{tag}</Badge>)}
      {structure.type === "psm" ? <Button variant="ghost" onClick={alert}>Editovat</Button> : null}
      {structure.type === "ds" && <Button asChild variant={"ghost"}><a href={import.meta.env.VITE_CME + "/core-v2?package-id=" + encodeURIComponent(structure.id ?? "")}>Open in CME</a></Button>}
      
      {/* <span className="text-sm text-gray-500">1 day ago</span> */}
    </div>
    {models?.length === 0 ? null : <ul className="pl-8">
      {models?.map(child => <Row structure={child} />)}
    </ul>}
  </li>
};

export default function Component() {
  const {isLoading, packages} = usePackage();

  return (
    <div>
      <h2 className="font-heading mt-12 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight first:mt-0">Available packages</h2>

      {isLoading && <div>
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

      {packages.length === 0 ? null : <ul>
        {packages.map(child => <Row structure={child} />)}
      </ul>}
    </div>
  )
}
