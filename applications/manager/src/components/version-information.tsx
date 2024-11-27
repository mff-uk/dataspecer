import { useState } from "react";
import { Github, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

let version: {
  commit: string;
  date: Date;
  build: number;
} | null = null;

if (import.meta.env.VITE_VCS_VERSION) {
  let [commit, date, build] = import.meta.env.VITE_VCS_VERSION.split(",");
  build = Number(build);
  date = new Date(date);

  version = {
    commit,
    date,
    build,
  }
}

export function VersionInformation() {
  const {t} = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);
  const handleClick = () => setIsOpen((prev) => !prev);

  if (!version) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-9 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <Info className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Version Information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Version Information</h4>
            <p className="text-sm text-muted-foreground">
              Version from: {t("$datetime", {val: version.date})}
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-sm font-medium">Commit number:</span>
              <span className="text-sm">{version.build}</span>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <span className="text-sm font-medium">Commit hash:</span>
              <span className="text-sm">
                <a href={`https://github.com/mff-uk/dataspecer/commit/${version.commit}`} className="flex items-center">
                  <Github className="h-[.9rem] w-[.9rem] mr-1" />
                  {version.commit.substring(0, 8)}
                </a>
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
