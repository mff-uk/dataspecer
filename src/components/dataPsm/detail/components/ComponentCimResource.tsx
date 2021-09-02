import React from "react";
import {Card, CardContent} from "@material-ui/core";
import {IRI} from "../../../helper/IRI";
import {useDetailStyles} from "../dataPsmDetailCommon";

export const ComponentCimResource: React.FC<{cimResourceIri: string}> = ({cimResourceIri}) => {
  const styles = useDetailStyles();

  return <Card className={styles.card}>
    <CardContent>
      <IRI href={cimResourceIri} />
    </CardContent>
  </Card>;
}
