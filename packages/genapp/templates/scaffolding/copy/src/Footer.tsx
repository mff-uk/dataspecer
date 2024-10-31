import { Box, Container, Link, Paper, Typography } from "@mui/material"


export const Footer = () => {
    return (
        <Paper sx={{
            marginTop: 'calc(5%)',
            width: "100%",
            height: "10%",
            bottom: 0,
            position: "fixed"
        }} component="footer" square variant="outlined">
      <Container maxWidth="lg">
        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: "flex",
            my:1
          }}
        >
          <Link href="/">
            Home page link
          </Link>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: "flex",
            mb: 2,
          }}
        >
          <Typography variant="caption" color="initial">
            Copyright ©{ new Date().getFullYear() }
          </Typography>
        </Box>
      </Container>
    </Paper>
    )
}