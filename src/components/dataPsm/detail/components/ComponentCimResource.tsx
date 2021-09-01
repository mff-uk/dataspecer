import React from "react";
import {Card, CardContent} from "@material-ui/core";
import {IRI} from "../../../helper/IRI";

export const ComponentCimResource: React.FC<{cimResourceIri: string}> = ({cimResourceIri}) => {
  return <Card>
    <CardContent>
      <IRI href={cimResourceIri} />
    </CardContent>
  </Card>;
}
