import React, { useEffect, useRef, useState } from "react"
import {
  Button,
  Card,
  CardContent,
  CardActionArea,
  Typography
} from "@material-ui/core"
import ButtonGroup from "@material-ui/core/ButtonGroup"
import LocalDrinkIcon from "@material-ui/icons/LocalDrink"
import AirlineSeatFlatIcon from "@material-ui/icons/AirlineSeatFlat"
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider
} from "@material-ui/core/styles"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import shp from "shpjs"

const styles = {
  width: "100vw",
  height: "calc(100vh - 64px)",
  position: "absolute"
}

const useStyles = makeStyles(uwTheme2 => ({
  card: {
    position: "absolute",
    "& > *": {
      margin: uwTheme2.spacing(1)
    },
    top: 76,
    right: 10,
    padding: 8,
    backgroundColor: "#646569",
    color: uwTheme2.tertiary,
    transition: "0.3s",
    boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)",
    "&:hover": {
      boxShadow: "0 16px 70px -12.125px rgba(0,0,0,0.3)"
    }
  }
}))

const uwTheme2 = createMuiTheme({
  palette: {
    primary: {
      main: "#c5050c"
    },
    secondary: {
      main: "#dadfe1"
    }
  },
  status: {
    danger: "orange"
  },
  overrides: {
    MuiCard: {
      root: {
        padding: 8
      }
    }
  }
})

const options = [
  {
    name: "Population",
    description: "Estimated total population",
    property: "pop_est",
    stops: [
      [0, "#f8d5cc"],
      [1000000, "#f4bfb6"],
      [5000000, "#f1a8a5"],
      [10000000, "#ee8f9a"],
      [50000000, "#ec739b"],
      [100000000, "#dd5ca8"],
      [250000000, "#c44cc0"],
      [500000000, "#9f43d7"],
      [1000000000, "#6e40e6"]
    ]
  },
  {
    name: "GDP",
    description: "Estimate total GDP in millions of dollars",
    property: "gdp_md_est",
    stops: [
      [0, "#f8d5cc"],
      [1000, "#f4bfb6"],
      [5000, "#f1a8a5"],
      [10000, "#ee8f9a"],
      [50000, "#ec739b"],
      [100000, "#dd5ca8"],
      [250000, "#c44cc0"],
      [5000000, "#9f43d7"],
      [10000000, "#6e40e6"]
    ]
  }
]

const MapboxGLMap = () => {
  const classes = useStyles()
  const [map, setMap] = useState(null)
  const [lat, setLat] = useState(44.95)
  const [lng, setLng] = useState(-90)
  const [zoom, setZoom] = useState(6.5)
  const mapContainer = useRef(null)
  const [activeWN, setActiveWN] = useState(true)
  const [activeCT, setActiveCT] = useState(true)

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY
    const initializeMap = ({ setMap, mapContainer }) => {
      var bounds = [
        [-95, 41], // Southwest coordinates
        [-85, 48] // Northeast coordinates
      ]

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10", // stylesheet location
        center: [lng, lat],
        zoom: zoom,
        minZoom: 6.5,
        maxBounds: bounds
      })

      const navOptions = {
        visualizePitch: "true"
      }
      map.addControl(
        new mapboxgl.NavigationControl({ options: navOptions }),
        "top-left"
      )
      map.addControl(
        new mapboxgl.FullscreenControl({
          container: document.querySelector("body")
        }),
        "top-left"
      )

      map.on("load", () => {
        setMap(map)
        map.resize()

        var layers = map.getStyle().layers
        // Find the index of the first symbol layer in the map style
        var firstSymbolId
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === "symbol") {
            firstSymbolId = layers[i].id
            break
          }
        }

        shp(process.env.PUBLIC_URL + "/shp/cancer_tracts.zip").then(
          function(geojsonCancerTracts) {
            map.addSource("cancer-tracts-data", {
              type: "geojson",
              data: geojsonCancerTracts
            })

            map.addLayer(
              {
                id: "cancer-tracts-data",
                type: "fill",
                source: "cancer-tracts-data",
                paint: {
                  "fill-color": "#f7f7f7",
                  "fill-opacity": 0.1
                },
                filter: ["==", "$type", "Polygon"]
              },
              "well-nitrate-data"
            )
          },
          function(err) {
            console.log("error:", err)
          }
        )

        shp(process.env.PUBLIC_URL + "/shp/well_nitrate.zip").then(
          function(geojsonWellNitrate) {
            map.addSource("well-nitrate-data", {
              type: "geojson",
              data: geojsonWellNitrate
            })

            map.addLayer(
              {
                id: "well-nitrate-data",
                type: "circle",
                source: "well-nitrate-data",
                paint: {
                  "circle-radius": 4,
                  "circle-color": "#B42222"
                },
                filter: ["==", "$type", "Point"]
              },
              firstSymbolId
            )
          },
          function(err) {
            console.log("error:", err)
          }
        )
      })
    }

    if (!map) initializeMap({ setMap, mapContainer })
  }, [map])

  const clickWN = () => {
    activeWN ? setActiveWN(false) : setActiveWN(true)
    map.setLayoutProperty(
      "well-nitrate-data",
      "visibility",
      activeWN ? "none" : "visible"
    )
  }

  const clickCT = () => {
    activeCT ? setActiveCT(false) : setActiveCT(true)
    map.setLayoutProperty(
      "cancer-tracts-data",
      "visibility",
      activeCT ? "none" : "visible"
    )
  }

  return (
    <div>
      <div ref={el => (mapContainer.current = el)} style={styles} />
      <div className={classes.toggleGroup}>
        <ThemeProvider theme={uwTheme2}>
          <Card className={classes.card} elevation={8}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                Analytic Tools
              </Typography>
              <Typography gutterBottom variant="h6" component="h2">
                Base Layers
              </Typography>
              <ButtonGroup
                orientation="vertical"
                color="primary"
                aria-label="vertical contained primary button group"
                variant="contained"
              >
                <Button
                  color={activeWN ? "primary" : "secondary"}
                  size="small"
                  onClick={clickWN}
                  startIcon={<LocalDrinkIcon />}
                >
                  Well Nitrate Data
                </Button>
                <Button
                  color={activeCT ? "primary" : "secondary"}
                  size="small"
                  onClick={clickCT}
                  startIcon={<AirlineSeatFlatIcon />}
                >
                  Cancer Tract Data
                </Button>
              </ButtonGroup>
              <Typography gutterBottom variant="h6" component="h2">
                Geospatial Analysis
              </Typography>
              <ButtonGroup
                orientation="vertical"
                color="primary"
                aria-label="vertical contained primary button group"
                variant="contained"
              >
                <Button size="small">Something Else Cool</Button>
              </ButtonGroup>
            </CardContent>
          </Card>
        </ThemeProvider>
      </div>
    </div>
  )
}

export default MapboxGLMap
