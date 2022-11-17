import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import {githubGist} from "react-syntax-highlighter/dist/esm/styles/hljs";
import React, {memo} from "react";

SyntaxHighlighter.registerLanguage("json", json);

export const ObjectDump: React.FC<{obj: any}> = memo(({obj}) =>
    <SyntaxHighlighter language="json" style={githubGist}>{JSON.stringify(obj, null, 2)}</SyntaxHighlighter>);
