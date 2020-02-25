import React, { useEffect, useRef, useState } from "react"
import {
  Button,
  Card,
  CardContent,
  Typography,
  ButtonGroup,
  Grid,
  Slider,
  Input,
  LinearProgress
} from "@material-ui/core"
import LocalDrinkIcon from "@material-ui/icons/LocalDrink"
import HomeWorkIcon from "@material-ui/icons/HomeWork"
import BlurCircularIcon from "@material-ui/icons/BlurCircular"
import MultilineChartIcon from "@material-ui/icons/MultilineChart"
import Icon from "@mdi/react"
import { mdiWeight } from "@mdi/js"
import { mdiHexagonMultiple } from "@mdi/js"
import {
  makeStyles,
  withStyles,
  createMuiTheme,
  ThemeProvider
} from "@material-ui/core/styles"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import shp from "shpjs"

import tagWorker from "workerize-loader!./tag" // eslint-disable-line import/no-webpack-loader-syntax
import aggregateWorker from "workerize-loader!./aggregate" // eslint-disable-line import/no-webpack-loader-syntax
import regressionWorker from "workerize-loader!./regression" // eslint-disable-line import/no-webpack-loader-syntax
var tagWorkerInstance = tagWorker()
var aggregateWorkerInstanceA = aggregateWorker()
var aggregateWorkerInstanceB = aggregateWorker()
var regressionWorkerInstance = regressionWorker()

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
    padding: 0,
    backgroundColor: "#ffffff95",
    color: uwTheme2.tertiary,
    transition: "0.3s",
    boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)",
    "&:hover": {
      boxShadow: "0 16px 70px -12.125px rgba(0,0,0,0.3)"
    }
  },
  typeHeaderBold: {
    fontWeight: 700
  },
  typeBold: {
    fontWeight: 700,
    paddingTop: uwTheme2.spacing(1.5),
    paddingBottom: uwTheme2.spacing(0.5)
  },
  layerButtons: {},
  kslider: {
    width: 180
  },
  input: {
    width: 40
  },
  loading: {
    width: "100%",
    position: "absolute",
    bottom: 0
  }
}))

const StyledButton = withStyles({
  root: {
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(99, 99, 99, .3)"
  },
  label: {
    textTransform: "capitalize"
  }
})(Button)

const uwTheme2 = createMuiTheme({
  palette: {
    primary: {
      main: "#636363"
    },
    secondary: {
      main: "#dadfe1"
    }
  },
  status: {
    danger: "orange"
  }
})

const options = [
  {
    name: "Spatial Regression",
    description: "R^2 Value for each polygon",
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
  const [activeSR, setActiveSR] = useState(false)
  const [kValue, setKValue] = React.useState(2)
  const [sizeValue, setSizeValue] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [wisc, setWisc] = React.useState(false)
  const [disableSR, setDisableSR] = React.useState(true)

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

      // Rip geojson of just wisconsin
      // For use in pairing down hexes from regression
      function resolveWisc() {
        return fetch(process.env.PUBLIC_URL + "./geojson/wisconsin.geojson")
          .then(response => {
            return response.json()
          })
          .catch(err => console.log("Error reading Wisconsin geojson: ", err))
          .then(data => {
            setWisc(data)
            return data
          })
      }

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

        // Promise function that returns a promise that resolves to a geojson of cancer tracts
        function resolveCancerTracts() {
          return shp(process.env.PUBLIC_URL + "/shp/cancer_tracts.zip").then(
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
                    "fill-color": [
                      "interpolate",
                      ["linear"],
                      ["get", "canrate"],
                      0,
                      "#542788",
                      0.1,
                      "#998ec3",
                      0.2,
                      "#d8daeb",
                      0.3,
                      "#fecc5c",
                      0.5,
                      "#fd8d3c",
                      0.8,
                      "#f03b20"
                    ],
                    "fill-opacity": 0.3
                  },
                  filter: ["==", "$type", "Polygon"]
                },
                "well-nitrate-data"
              )

              return geojsonCancerTracts
            },
            function(err) {
              console.log("error:", err)
            }
          )
        }

        // Promise function that returns a promise that resolves to a geojson of nitrate points
        function resolveNitratePoints() {
          return shp(process.env.PUBLIC_URL + "/shp/well_nitrate.zip").then(
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
                    "circle-radius": [
                      "interpolate",
                      ["linear"],
                      ["get", "nitr_con"],
                      0,
                      3,
                      5.5,
                      5,
                      11,
                      7,
                      16.5,
                      9
                    ],
                    "circle-color": [
                      "interpolate",
                      ["linear"],
                      ["get", "nitr_con"],
                      0,
                      "#2166ac",
                      5.5,
                      "#67a9cf",
                      11,
                      "#ef8a62",
                      16.5,
                      "#b2182b"
                    ]
                  },
                  filter: ["==", "$type", "Point"]
                },
                firstSymbolId
              )

              return geojsonWellNitrate
            },
            function(err) {
              console.log("error:", err)
            }
          )
        }

        // Promise function to calculate IDW on nitrate values
        function nitrateAggregate(geojsonEnriched) {
          return new Promise((resolve, reject) => {
            // Prepare spatial regression options based on k State value
            var optionsN = {
              gridType: "hex",
              property: "nitr_con",
              units: "kilometers",
              weight: kValue
            }

            aggregateWorkerInstanceA.addEventListener("message", message => {
              if (message.data.type === "FeatureCollection") {
                var hexGridN = message.data
                resolve(hexGridN)
              }
            })
            aggregateWorkerInstanceA.aggregateStuff(
              geojsonEnriched,
              sizeValue,
              optionsN
            )
          })
        }

        // Promise function to calculate IDW on cancer values
        function cancerAggregate(geojsonEnriched) {
          return new Promise((resolve, reject) => {
            // Prepare spatial regression options based on k State value
            var optionsC = {
              gridType: "hex",
              property: "canrate",
              units: "kilometers",
              weight: kValue
            }

            aggregateWorkerInstanceB.addEventListener("message", message => {
              if (message.data.type === "FeatureCollection") {
                var hexGridC = message.data
                resolve(hexGridC)
              }
            })
            aggregateWorkerInstanceB.aggregateStuff(
              geojsonEnriched,
              sizeValue,
              optionsC
            )
          })
        }

        async function resolveSpatialRegression() {
          // Asynchronously request both geojson feature collections
          const [geojsonWellNitrate, geojsonCancerTracts] = await Promise.all([
            resolveNitratePoints(),
            resolveCancerTracts()
          ])

          // Tag nitrate points with cancer tract data (~12 seconds)
          // Use web worker to do with separate thread behind the scenes
          tagWorkerInstance.addEventListener("message", message => {
            if (message.data.type === "FeatureCollection") {
              var geojsonEnriched = message.data

              map.removeLayer("well-nitrate-data")
              map.removeSource("well-nitrate-data")

              map.addSource("well-nitrate-data", {
                type: "geojson",
                data: geojsonEnriched
              })

              map.addLayer(
                {
                  id: "well-nitrate-data",
                  type: "circle",
                  source: "well-nitrate-data",
                  paint: {
                    "circle-radius": [
                      "interpolate",
                      ["linear"],
                      ["get", "nitr_con"],
                      0,
                      3,
                      5.5,
                      5,
                      11,
                      7,
                      16.5,
                      9
                    ],
                    "circle-color": [
                      "interpolate",
                      ["linear"],
                      ["get", "nitr_con"],
                      0,
                      "#2166ac",
                      5.5,
                      "#67a9cf",
                      11,
                      "#ef8a62",
                      16.5,
                      "#b2182b"
                    ]
                  },
                  filter: ["==", "$type", "Point"]
                },
                firstSymbolId
              )

              // Asynchronously resolve each aggregation prior to regression calc
              async function resolveAggregateAsync(geojsonEnriched) {
                const [hexNitrate, hexCancer, wiscData] = await Promise.all([
                  nitrateAggregate(geojsonEnriched),
                  cancerAggregate(geojsonEnriched),
                  resolveWisc()
                ])

                // Initial regression calc
                regressionWorkerInstance.addEventListener(
                  "message",
                  message => {
                    if (message.data.type === "FeatureCollection") {
                      var hexGrid = message.data

                      if (
                        map.getLayer("spatial-regression-data") !== undefined
                      ) {
                        map.removeLayer("spatial-regression-data")
                        map.removeSource("spatial-regression-data")
                      }

                      map.addSource("spatial-regression-data", {
                        type: "geojson",
                        data: hexGrid
                      })

                      map.addLayer({
                        id: "spatial-regression-data",
                        type: "fill-extrusion",
                        source: "spatial-regression-data",
                        layout: {
                          visibility: "none"
                        },
                        paint: {
                          "fill-extrusion-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "std_res"],
                            -3,
                            "#252525",
                            0,
                            "#1b7837",
                            3,
                            "#ffeda0"
                          ],
                          "fill-extrusion-height": [
                            "interpolate",
                            ["linear"],
                            ["get", "std_res"],
                            -3,
                            -100,
                            3,
                            150000
                          ],
                          "fill-extrusion-base": 0,
                          "fill-extrusion-opacity": 0.6,
                          "fill-extrusion-opacity-transition": {
                            duration: 2000
                          }
                        }
                      })
                      setDisableSR(false)
                    }
                  }
                )
                regressionWorkerInstance.regressionStuff(
                  hexNitrate,
                  hexCancer,
                  wiscData
                )
              }

              resolveAggregateAsync(geojsonEnriched)
            }
          })
          // Issue tagging request
          tagWorkerInstance.tagStuff(geojsonWellNitrate, geojsonCancerTracts)
        }

        resolveSpatialRegression()

        // Create a popup, but don't add it to the map yet.
        var popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        })

        // Nitrate pop up spec
        map.on("mouseenter", "well-nitrate-data", function(e) {
          // Change the cursor style as a UI indicator.
          map.getCanvas().style.cursor = "pointer"
          var coordinates = e.features[0].geometry.coordinates.slice()
          var nitrate_value = e.features[0].properties.nitr_con
          var body =
            "Nitrate Value: <strong>" +
            nitrate_value.toFixed(2) +
            " mg/L</strong>"

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
          }

          // Populate the popup and set its coordinates
          // based on the feature found.
          popup
            .setLngLat(coordinates)
            .setHTML(body)
            .addTo(map)
        })

        // Remove point pop up
        map.on("mouseleave", "well-nitrate-data", function() {
          map.getCanvas().style.cursor = ""
          popup.remove()
        })

        // Add tooltip on mouse move for points and tracts
        // Deconflict between layers within this function
        map.on("mousemove", function(e) {
          // Change the cursor style as a UI indicator.
          var features = map.queryRenderedFeatures(e.point)
          console.log(features)

          // Populate the popup and set its coordinates
          // based on the feature found.
          const setPopUp = (coordinates, body) => {
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
            }
            popup
              .setLngLat(coordinates)
              .setHTML(body)
              .addTo(map)
          }

          var coordinates = [e.lngLat.lng, e.lngLat.lat]
          if (features[0] !== undefined) {
            if (features[0].layer.id === "well-nitrate-data") {
              map.getCanvas().style.cursor = "pointer"
              var data_value = features[0].properties.nitr_con
              var body =
                "Nitrate Value: <strong>" +
                data_value.toFixed(2) +
                " mg/L</strong>"
              setPopUp(coordinates, body)
            } else if (features[0].layer.id === "cancer-tracts-data") {
              map.getCanvas().style.cursor = "pointer"
              var data_value = features[0].properties.canrate * 100
              var body =
                "Cancer Rate: <strong>" + data_value.toFixed(0) + "%</strong>"
              setPopUp(coordinates, body)
            } else if (features[0].layer.id === "spatial-regression-data") {
              var std_res_value = features[0].properties.std_res
              if (std_res_value !== -99) {
                map.getCanvas().style.cursor = "pointer"
                var cancer_value = features[0].properties.canrate * 100
                var pred_cancer_value =
                  features[0].properties.pred_canrate * 100
                var body1 =
                  "Actual Cancer Rate: <strong>" +
                  cancer_value.toFixed(0) +
                  "%</strong>"
                var body2 =
                  "<br />Predicted Cancer Rate: <strong>" +
                  pred_cancer_value.toFixed(0) +
                  "%</strong>"
                var body3 =
                  "<br />Standardized Residual: <strong>" +
                  std_res_value.toFixed(2) +
                  "</strong>"
                setPopUp(coordinates, body1.concat(body2, body3))
              } else {
                map.getCanvas().style.cursor = ""
                popup.remove()
              }
            }
          }
        })

        // Remove tracts pop up
        map.on("mouseleave", "cancer-tracts-data", function() {
          map.getCanvas().style.cursor = ""
          popup.remove()
        })

        // Remove regression pop up
        map.on("mouseleave", "spatial-regression-data", function() {
          map.getCanvas().style.cursor = ""
          popup.remove()
        })
      })
    }

    if (!map) initializeMap({ setMap, mapContainer })
  }, [map])

  const calcSR = (kValue, sizeValue) => {
    var geojsonEnriched = map.getSource("well-nitrate-data")._data

    // Promise function to calculate IDW on nitrate values
    function nitrateAggregate(geojsonEnriched) {
      return new Promise((resolve, reject) => {
        // Prepare spatial regression options based on k State value
        var optionsN = {
          gridType: "hex",
          property: "nitr_con",
          units: "kilometers",
          weight: kValue
        }

        aggregateWorkerInstanceA.terminate()
        aggregateWorkerInstanceA = aggregateWorker()

        aggregateWorkerInstanceA.addEventListener("message", message => {
          if (message.data.type === "FeatureCollection") {
            var hexGridN = message.data
            resolve(hexGridN)
          }
        })
        aggregateWorkerInstanceA.aggregateStuff(
          geojsonEnriched,
          sizeValue,
          optionsN
        )
      })
    }

    // Promise function to calculate IDW on cancer values
    function cancerAggregate(geojsonEnriched) {
      return new Promise((resolve, reject) => {
        // Prepare spatial regression options based on k State value
        var optionsC = {
          gridType: "hex",
          property: "canrate",
          units: "kilometers",
          weight: kValue
        }

        aggregateWorkerInstanceB.terminate()
        aggregateWorkerInstanceB = aggregateWorker()

        aggregateWorkerInstanceB.addEventListener("message", message => {
          if (message.data.type === "FeatureCollection") {
            var hexGridC = message.data
            resolve(hexGridC)
          }
        })
        aggregateWorkerInstanceB.aggregateStuff(
          geojsonEnriched,
          sizeValue,
          optionsC
        )
      })
    }

    async function resolveAggregateAsync(geojsonEnriched) {
      const [hexNitrate, hexCancer] = await Promise.all([
        nitrateAggregate(geojsonEnriched),
        cancerAggregate(geojsonEnriched)
      ])

      regressionWorkerInstance.terminate()
      regressionWorkerInstance = regressionWorker()

      // Initial regression calc
      regressionWorkerInstance.addEventListener("message", message => {
        if (message.data.type === "FeatureCollection") {
          var hexGrid = message.data

          if (map.getLayer("spatial-regression-data") !== undefined) {
            map.removeLayer("spatial-regression-data")
            map.removeSource("spatial-regression-data")
          }

          map.addSource("spatial-regression-data", {
            type: "geojson",
            data: hexGrid
          })

          map.addLayer({
            id: "spatial-regression-data",
            type: "fill-extrusion",
            source: "spatial-regression-data",
            layout: {
              visibility: "visible"
            },
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["get", "std_res"],
                -3,
                "#252525",
                0,
                "#1b7837",
                3,
                "#ffeda0"
              ],
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["get", "std_res"],
                -3,
                0,
                3,
                150000
              ],
              "fill-extrusion-base": 0,
              "fill-extrusion-opacity": 0.6,
              "fill-extrusion-opacity-transition": {
                duration: 2000
              }
            }
          })
          setActiveSR(true)
          setLoading(false)
        }
      })
      regressionWorkerInstance.regressionStuff(hexNitrate, hexCancer, wisc)
    }

    resolveAggregateAsync(geojsonEnriched)
  }

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

  const clickSR = () => {
    activeSR ? setActiveSR(false) : setActiveSR(true)
    map.setLayoutProperty(
      "spatial-regression-data",
      "visibility",
      activeSR ? "none" : "visible"
    )
  }

  const handleKSliderChange = (event, newValue) => {
    setLoading(true)
    setKValue(newValue)
    calcSR(newValue, sizeValue)
  }

  const handleKInputChange = event => {
    setLoading(true)
    setKValue(event.target.value === "" ? "" : Number(event.target.value))
    if (event.target.value !== "") {
      calcSR(Number(event.target.value), sizeValue)
    }
  }

  const handleSizeSliderChange = (event, newValue) => {
    setLoading(true)
    setSizeValue(newValue)
    calcSR(kValue, newValue)
  }

  const handleSizeInputChange = event => {
    setLoading(true)
    setSizeValue(event.target.value === "" ? "" : Number(event.target.value))
    if (event.target.value !== "") {
      calcSR(kValue, Number(event.target.value))
    }
  }

  const handleBlurK = () => {
    if (kValue < 0) {
      setKValue(0)
    } else if (kValue > 5) {
      setKValue(5)
    }
  }

  const handleBlurSize = () => {
    if (sizeValue < 5) {
      setSizeValue(5)
    } else if (sizeValue > 35) {
      setSizeValue(35)
    }
  }

  return (
    <div>
      <div ref={el => (mapContainer.current = el)} style={styles} />
      <div className={classes.toggleGroup}>
        <ThemeProvider theme={uwTheme2}>
          <Card className={classes.card} elevation={8}>
            <CardContent>
              <Typography
                className={classes.typeHeaderBold}
                variant="h5"
                align="center"
              >
                Analytic Tools
              </Typography>
              <Typography
                className={classes.typeBold}
                variant="subtitle2"
                align="right"
              >
                Layer Toggles
              </Typography>
              <ButtonGroup
                orientation="vertical"
                color="primary"
                aria-label="vertical contained primary button group"
                variant="contained"
                className="layerButtons"
              >
                <StyledButton
                  color={activeWN ? "primary" : "secondary"}
                  onClick={clickWN}
                  startIcon={<LocalDrinkIcon style={{ fill: "#2166ac" }} />}
                  endIcon={<LocalDrinkIcon style={{ fill: "#b2182b" }} />}
                >
                  Well Nitrate Data
                </StyledButton>
                <StyledButton
                  color={activeCT ? "primary" : "secondary"}
                  onClick={clickCT}
                  startIcon={<HomeWorkIcon style={{ fill: "#542788" }} />}
                  endIcon={<HomeWorkIcon style={{ fill: "#f03b20" }} />}
                >
                  Census Cancer Data
                </StyledButton>
                <StyledButton
                  color={activeSR ? "primary" : "secondary"}
                  onClick={clickSR}
                  startIcon={<BlurCircularIcon style={{ fill: "#1b7837" }} />}
                  endIcon={<MultilineChartIcon style={{ fill: "#ffeda0" }} />}
                  disabled={disableSR}
                >
                  Spatial Regression
                </StyledButton>
              </ButtonGroup>
              <Typography
                className={classes.typeBold}
                variant="subtitle2"
                align="right"
              >
                Inverse Distance Weight (k)
              </Typography>
              <div className={classes.kslider}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Icon
                      path={mdiWeight}
                      title=""
                      size={1}
                      horizontal
                      vertical
                      rotate={180}
                      color="#636363"
                    />
                  </Grid>
                  <Grid item xs>
                    <Slider
                      value={typeof kValue === "number" ? kValue : 0}
                      onChange={handleKSliderChange}
                      aria-labelledby="input-slider"
                      disabled={disableSR}
                      step={0.2}
                      min={1}
                      max={5}
                    />
                  </Grid>
                  <Grid item style={{ paddingRight: 0 }}>
                    <Input
                      className={classes.input}
                      value={kValue}
                      margin="dense"
                      onChange={handleKInputChange}
                      onBlur={handleBlurK}
                      disabled={disableSR}
                      inputProps={{
                        step: 0.2,
                        min: 1,
                        max: 5,
                        type: "number",
                        "aria-labelledby": "input-slider"
                      }}
                    />
                  </Grid>
                </Grid>
              </div>
              <Typography
                className={classes.typeBold}
                variant="subtitle2"
                align="right"
              >
                Hexagon Size (sqkm)
              </Typography>
              <div className={classes.kslider}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Icon
                      path={mdiHexagonMultiple}
                      title=""
                      size={1}
                      horizontal
                      vertical
                      rotate={180}
                      color="#636363"
                    />
                  </Grid>
                  <Grid item xs>
                    <Slider
                      value={typeof sizeValue === "number" ? sizeValue : 0}
                      onChange={handleSizeSliderChange}
                      aria-labelledby="input-s-slider"
                      disabled={disableSR}
                      step={3}
                      min={3}
                      max={21}
                    />
                  </Grid>
                  <Grid item style={{ paddingRight: 0 }}>
                    <Input
                      className={classes.input}
                      value={sizeValue}
                      margin="dense"
                      onChange={handleSizeInputChange}
                      onBlur={handleBlurSize}
                      disabled={disableSR}
                      inputProps={{
                        step: 3,
                        min: 3,
                        max: 21,
                        type: "number",
                        "aria-labelledby": "input-s-slider"
                      }}
                    />
                  </Grid>
                </Grid>
              </div>
            </CardContent>
          </Card>
          <div className={classes.loading}>{loading && <LinearProgress />}</div>
        </ThemeProvider>
      </div>
    </div>
  )
}

export default MapboxGLMap
