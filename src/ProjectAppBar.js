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
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"
import GitHubIcon from "@material-ui/icons/GitHub"
import LinkedInIcon from "@material-ui/icons/LinkedIn"
import EmailIcon from "@material-ui/icons/Email"

const useStyles = makeStyles(uwTheme => ({
  grow: {
    flexGrow: 1
  },
  logo: {
    maxWidth: 35,
    paddingRight: 15
  },
  title: {
    display: "block"
  },
  inputRoot: {
    color: "inherit"
  },
  sectionDesktop: {
    display: "flex"
  },
  backdrop: {
    zIndex: uwTheme.zIndex.drawer + 1,
    color: "#fff"
  },
  card: {
    maxWidth: 450
  },
  media: {
    height: 300
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
              Spatial Analysis: Nitrate & Cancer
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
        >
          <Card className={classes.card}>
            <CardActionArea>
              <CardMedia
                className={classes.media}
                image="water.jpg"
                title="nitrate explosion"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Spatial Analysis: Nitrate & Cancer
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  gutterBottom
                >
                  This web application was created to aid in exploration and
                  visualization of a potential relationship between water
                  nitrate levels and cancer rates in Wisconsin. The data used in
                  the analysis: 1) locations of cancer occurrences collected
                  over a ten-year period 2) nitrate levels from test wells
                  throughout each county in the state of Wisconsin.
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  gutterBottom
                >
                  The application uses Inverse Distance Weighted (IDW)
                  interpolation technique to produce a raster map of nitrate
                  levels in WI. This technique is explicit in implying that
                  close things are more related than distant things and
                  allocates weights quantitatively based on distance. The second
                  analysis layer in the application produces an Ordinary Least
                  Squares linear regression to model a dependent variable
                  (cancer rates) in terms of its relationship to the explanatory
                  variable (nitrate levels).
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  gutterBottom
                >
                  Authored by Andrew Pittman as a part of capstone project for
                  the University of Wisconsin Madison.
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <IconButton
                variant="link"
                aria-label="GitHubIcon"
                color="inherit"
                href="https://github.com/dro0o"
                target="_blank"
              >
                <Badge color="secondary">
                  <GitHubIcon />
                </Badge>
              </IconButton>
              <IconButton
                variant="link"
                aria-label="LinkedInIcon"
                color="inherit"
                href="https://www.linkedin.com/in/andrew-pittman-a1618922/"
                target="_blank"
              >
                <Badge color="secondary">
                  <LinkedInIcon />
                </Badge>
              </IconButton>
              <IconButton
                variant="link"
                aria-label="EmailIcon"
                color="inherit"
                href="mailto: andrew@pittman.dev"
                target="_blank"
              >
                <Badge color="secondary">
                  <EmailIcon />
                </Badge>
              </IconButton>
            </CardActions>
          </Card>
        </Backdrop>
      </ThemeProvider>
    </div>
  )
}
