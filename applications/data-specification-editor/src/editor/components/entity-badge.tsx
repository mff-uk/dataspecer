import { ExternalEntityWrapped } from "@dataspecer/core-v2/hierarchical-semantic-aggregator";

export type ExternalEntityBadgeProps = {
  entity: ExternalEntityWrapped;
};

export function ExternalEntityBadge(props: ExternalEntityBadgeProps) {
  if (props.entity?.vocabularyChain?.length > 0) {
    return (<span style={{
      marginLeft: ".5rem",
      // @ts-ignore
      background: props.entity.vocabularyChain[0].color ?? "#4998f9",
      padding: ".1rem .3rem",
      borderRadius: "4px",
      display: "inline-block",
    }}>
      {/* @ts-ignore */}
      {props.entity.vocabularyChain[0].name}
    </span>);
  }
}