import React from "react"
import { makeStyles } from "@material-ui/core/styles"
// import * as Colors from "@material-ui/core/styles/colors"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"
import Typography from "@material-ui/core/Typography"
import Badge from "@material-ui/core/Badge"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  customAppBar: {
    // textColor: Colors
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block"
    }
  },
  inputRoot: {
    color: "inherit"
  },
  sectionDesktop: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex"
    }
  }
}))

export default function PrimarySearchAppBar() {
  const classes = useStyles()

  return (
    <div className={classes.grow}>
      <AppBar position="static" color="#c5050c">
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            WI Nitrate/Cancer Spatial Analysis
          </Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton aria-label="HelpOutlineIcon" color="inherit">
              <Badge color="secondary">
                <HelpOutlineIcon />
              </Badge>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  )
}
