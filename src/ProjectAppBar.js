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
import AccountCircleIcon from "@material-ui/icons/AccountCircle"

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
      main: "#252525"
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
                  This web application was developed to enable exploration and
                  visualization of a potential relationship between water
                  nitrate levels and cancer rates in Wisconsin. The analysis
                  data includes normalized cancer occurrence rates aggregated by
                  census tract and collected over a ten-year period, as well as
                  nitrate levels from test wells throughout each county in the
                  state.
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  gutterBottom
                >
                  The application uses the Inverse Distance Weighted (IDW)
                  interpolation technique to produce two spatial aggregations,
                  one of nitrate levels and one of normalized cancer rates. The
                  IDW method is explicit in implying that close things are more
                  related than distant things and allocates weights
                  quantitatively based on distance. The resulting analysis layer
                  leverages the two spatial aggregations to produced an Ordinary
                  Least Squares (OLS) linear regression to model a dependent
                  variable (normalized cancer rates) in terms of its
                  relationship to the explanatory variable (nitrate levels).
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  gutterBottom
                >
                  Developed by Andrew Pittman as a part of capstone project for
                  the University of Wisconsin Madison.
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <IconButton
                variant="link"
                aria-label="PortfolioIcon"
                color="inherit"
                href="https://adp6729.github.io/react-mdl-portfolio/"
                target="_blank"
              >
                <Badge color="secondary">
                  <AccountCircleIcon />
                </Badge>
              </IconButton>
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
