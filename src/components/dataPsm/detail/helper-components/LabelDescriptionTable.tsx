import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";
import {LanguageString} from "model-driven-data/core";

export const LabelDescriptionTable: React.FC<{label: LanguageString | undefined, description: LanguageString | undefined}> = ({label, description}) => {
  const languages = [...new Set([...Object.keys(label ?? {}), ...Object.keys(description ?? {})])].sort();

  return <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Language</TableCell>
        <TableCell>Label</TableCell>
        <TableCell>Description</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {languages.map(language =>
        <TableRow key={language}>
          <TableCell>{language}</TableCell>
          <TableCell>{label?.[language]}</TableCell>
          <TableCell>{description?.[language]}</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>;
}
