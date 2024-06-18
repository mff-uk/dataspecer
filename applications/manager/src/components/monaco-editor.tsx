import * as React from "react";
import {FC} from "react";
import RawMonacoEditor from "@monaco-editor/react";
import * as monaco from 'monaco-editor';
import { useTheme } from "next-themes";

function handleEditorWillMount(monaco) {
  monaco.editor.defineTheme('dataspecer-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
    ],
    colors: {
      'editor.background': '#0a0a0a',
    }
  });
}

export const MonacoEditor: FC<{
  refs: React.MutableRefObject<{ editor: monaco.editor.IStandaloneCodeEditor } | undefined>,
  defaultValue: string,
}> = (props) => {
  const { resolvedTheme } = useTheme();

  return <div className="flex flex-col grow min-h-[12cm]">
      <RawMonacoEditor
          onMount={editor => props.refs.current = {editor}}
          className="min-h-[12cm]"
          theme={resolvedTheme === "dark" ? "dataspecer-dark" : "vs"}
          language="handlebars"
          defaultValue={props.defaultValue}
          beforeMount={handleEditorWillMount}
          options={{
              wordWrap: "on",
              minimap: {
                  enabled: false
              },
              insertSpaces: true,
          }}
      />
  </div>;
}