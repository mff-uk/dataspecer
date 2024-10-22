// import { alpha } from "@mui/material";
// import { styled } from "@mui/system";
import React from "react";

// const SlovnikBadge = styled('span')(
//     ({ theme }) => ({
//         color: theme.palette.primary.main,
//         marginLeft: ".5rem",
//         background: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
//         padding: ".2rem .5rem",
//         borderRadius: theme.shape.borderRadius
//     })
// );

export const SlovnikGovCzGlossary: React.FC<{cimResourceIri: string}> = ({cimResourceIri}) => {
    // const {cim} = React.useContext(ConfigurationContext);
    // const [groups] = useAsyncMemo(async () => await cim.cimAdapter.getResourceGroup?.(cimResourceIri) ?? [], [cimResourceIri, cim.cimAdapter]);

    // if (groups) {
    //     return <>{groups.map(group => {
    //         const chunks = group.substr("https://slovník.gov.cz/".length).split("/");
    //         switch (chunks[0]) {
    //             case "legislativní":
    //                 return <SlovnikBadge key={group}>{chunks[0]} <strong>{chunks[2]}/{chunks[3]} Sb.</strong></SlovnikBadge>;
    //             case "agendový":
    //                 return <SlovnikBadge key={group}>{chunks[0]} <strong>{chunks[1]}</strong></SlovnikBadge>;
    //             default:
    //                 return <SlovnikBadge key={group}>{chunks[0]}</SlovnikBadge>;
    //         }
    //     })}</>;
    // } else {
        return null;
    // }
}
