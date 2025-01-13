export const IriLink = (props: { iri: string | undefined | null }) => {
  return (
    <a href={props.iri ? props.iri : "#"} target="_blank">
            📑
    </a>
  );
};
