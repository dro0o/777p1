import React from "react"
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider
} from "@material-ui/core/styles"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"
import Typography from "@material-ui/core/Typography"
import Badge from "@material-ui/core/Badge"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"
import Backdrop from "@material-ui/core/Backdrop"

const useStyles = makeStyles(uwTheme => ({
  grow: {
    flexGrow: 1
  },
  logo: {
    maxWidth: 35,
    paddingRight: 15
  },
  title: {
    display: "none",
    [uwTheme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  inputRoot: {
    color: "inherit"
  },
  sectionDesktop: {
    display: "none",
    [uwTheme.breakpoints.up("md")]: {
      display: "flex"
    }
  },
  backdrop: {
    zIndex: uwTheme.zIndex.drawer + 1,
    color: "#fff"
  }
}))

const uwTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#c5050c"
    },
    secondary: {
      main: "#9b0000"
    }
  },
  status: {
    danger: "orange"
  }
})

export default function PrimarySearchAppBar() {
  const classes = useStyles()
  const [bdOpen, setBDOpen] = React.useState(false)
  const handleBDToggle = () => {
    setBDOpen(!bdOpen)
  }
  const handleBDClose = () => {
    setBDOpen(false)
  }

  return (
    <div className={classes.grow}>
      <ThemeProvider theme={uwTheme}>
        <AppBar position="static">
          <Toolbar>
            <img
              src="nitrate_personal.png"
              alt="logo"
              className={classes.logo}
            />
            <Typography className={classes.title} variant="h6" noWrap>
              Wisconsin Spatial Analysis: Nitrate & Cancer
            </Typography>
            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
              <IconButton
                aria-label="HelpOutlineIcon"
                color="inherit"
                onClick={handleBDToggle}
              >
                <Badge color="secondary">
                  <HelpOutlineIcon />
                </Badge>
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        <Backdrop
          className={classes.backdrop}
          open={bdOpen}
          onClick={handleBDClose}
        ></Backdrop>
      </ThemeProvider>
    </div>
  )
}
