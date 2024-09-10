import { AppBar, Toolbar, Typography } from "@mui/material"

export const TopBar = () => {
    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Generated application sample
          </Typography>
        </Toolbar>
      </AppBar>
    )
}