import { Box, Toolbar } from "@mui/material"

export const Content = ({ children }) => {
    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            { children }
            <Box component="section" sx={{
                p: 1,
                color: "transparent",
                width: "90%",
                height: "10%",
                maxHeight: "200px"
            }} />
        </Box>
    )
}