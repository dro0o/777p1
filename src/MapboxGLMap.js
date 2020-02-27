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
import GetAppIcon from "@material-ui/icons/GetApp"
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
    top: 74,
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
  kslider: {
    width: 180
  },
  legends: {
    // width: "100vw"
  },
  input: {
    width: 40
  },
  loading: {
    width: "100%",
    position: "absolute",
    bottom: 0
  },
  export: {
    marginLeft: "50"
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
    description: "Standard residual for each hexagon",
    stops: [
      [-3, "#ffff00", 12, 108, "round-full"],
      [-2, "#ffff66", 12, 72, "round-full"],
      [-1, "#5fa941", 12, 36, "round-full"],
      [0, "#038145", 12, 12, "round-full"],
      [1, "#29a869", 12, 36, "round-full"],
      [2, "#009999", 12, 72, "round-full"],
      [3, "#006666", 12, 108, "round-full"]
    ]
  },
  {
    name: "Well Nitrate Data",
    description: "Test data derived from Wisconsin wells (mg/L)",
    stops: [
      [0, "#2166ac", 12, 12, "round-full"],
      [6, "#67a9cf", 18, 18, "round-full"],
      [12, "#ef8a62", 24, 24, "round-full"],
      [18, "#b2182b", 36, 36, "round-full"]
    ]
  },
  {
    name: "Census Cancer Data",
    description: "Cancer occurences divided by tract population (%)",
    stops: [
      [0, "#542788", 12, 12, ""],
      [0.1, "#998ec3", 12, 12, ""],
      [0.2, "#d8daeb", 12, 12, ""],
      [0.3, "#fecc5c", 12, 12, ""],
      [0.5, "#fd8d3c", 12, 12, ""],
      [0.8, "#f03b20", 12, 12, ""]
    ]
  }
]

const MapboxGLMap = () => {
  const classes = useStyles()
  const [map, setMap] = useState(null)
  const [lat, setLat] = useState(44.95)
  const [lng, setLng] = useState(-90)
  const [zoom, setZoom] = useState(6)
  const mapContainer = useRef(null)
  const [activeWN, setActiveWN] = useState(true)
  const [activeCT, setActiveCT] = useState(true)
  const [activeSR, setActiveSR] = useState(false)
  const [kValue, setKValue] = React.useState(2)
  const [sizeValue, setSizeValue] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [wisc, setWisc] = React.useState(false)
  const [disableSR, setDisableSR] = React.useState(true)
  // const [legendID, setLegendID] = React.useState([0, 1])

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY
    const initializeMap = ({ setMap, mapContainer }) => {
      var bounds = [
        [-108, 28], // Southwest coordinates
        [-72, 58] // Northeast coordinates
      ]

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10", // stylesheet location
        center: [lng, lat],
        zoom: zoom,
        minZoom: 5,
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
                            -10,
                            "#252525",
                            -3,
                            "#ffff00",
                            -2,
                            "#ffff66",
                            -1,
                            "#5fa941",
                            0,
                            "#038145",
                            1,
                            "#29a869",
                            2,
                            "#009999",
                            3,
                            "#006666"
                          ],
                          "fill-extrusion-height": [
                            "interpolate",
                            ["linear"],
                            ["get", "abs_val_std_res"],
                            -10,
                            -100,
                            0,
                            0,
                            3,
                            200000
                          ],
                          "fill-extrusion-base": 0,
                          "fill-extrusion-opacity": 0.7,
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
          // console.log(features)

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
              var data_value = features[0].properties.canrate
              var body =
                "Cancer Rate: <strong>" + data_value.toFixed(2) + "%</strong>"
              setPopUp(coordinates, body)
            } else if (features[0].layer.id === "spatial-regression-data") {
              var std_res_value = features[0].properties.std_res
              if (std_res_value !== -99) {
                map.getCanvas().style.cursor = "pointer"
                var cancer_value = features[0].properties.canrate
                var pred_cancer_value = features[0].properties.pred_canrate
                var r2_value = features[0].properties.r2
                var body1 =
                  "Actual Cancer Rate: <strong>" +
                  cancer_value.toFixed(2) +
                  "%</strong>"
                var body2 =
                  "<br />Predicted Cancer Rate: <strong>" +
                  pred_cancer_value.toFixed(2) +
                  "%</strong>"
                var body3 =
                  "<br />Standardized Residual: <strong>" +
                  std_res_value.toFixed(2) +
                  "</strong>"
                var body4 =
                  "<br />R^2 Value: <strong>" +
                  r2_value.toFixed(4) +
                  "</strong>"
                setPopUp(coordinates, body1.concat(body2, body3, body4))
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
                -10,
                "#252525",
                -3,
                "#ffff00",
                -2,
                "#ffff66",
                -1,
                "#5fa941",
                0,
                "#038145",
                1,
                "#29a869",
                2,
                "#00ffff",
                3,
                "#0099cc"
              ],
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["get", "abs_val_std_res"],
                -10,
                -100,
                0,
                0,
                3,
                200000
              ],
              "fill-extrusion-base": 0,
              "fill-extrusion-opacity": 0.7,
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
    var newK = event.target.value === "" ? "" : Number(event.target.value)
    if (newK < 1) {
      newK = 1
    } else if (newK > 5) {
      newK = 5
    }
    setKValue(newK)
    if (event.target.value !== "") {
      calcSR(newK, sizeValue)
    }
  }

  const handleSizeSliderChange = (event, newValue) => {
    setLoading(true)
    setSizeValue(newValue)
    calcSR(kValue, newValue)
  }

  const handleSizeInputChange = event => {
    setLoading(true)
    var newSize = event.target.value === "" ? "" : Number(event.target.value)
    if (newSize < 3) {
      newSize = 3
    } else if (newSize > 21) {
      newSize = 21
    }
    setSizeValue(newSize)
    if (event.target.value !== "") {
      calcSR(kValue, newSize)
    }
  }

  const handleBlurK = () => {
    if (kValue < 1) {
      setKValue(1)
    } else if (kValue > 5) {
      setKValue(5)
    }
  }

  const handleBlurSize = () => {
    if (sizeValue < 3) {
      setSizeValue(3)
    } else if (sizeValue > 21) {
      setSizeValue(21)
    }
  }

  const clickExport = () => {
    var spatialRegressionGeoJson = map.getSource("spatial-regression-data")
      ._data

    var fileName = "spatial_regression_k-".concat(
      kValue.toString(),
      "_size-",
      sizeValue.toString(),
      ".geojson"
    )
    var blob = new Blob([JSON.stringify(spatialRegressionGeoJson, null, 2)], {
      type: "application/json",
      name: fileName
    })
    var url = window.URL.createObjectURL(blob)

    var a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"

    a.href = url
    a.download = fileName
    a.click()

    window.URL.revokeObjectURL(url)

    console.log(fileName)
  }

  const renderLegendKeys = (stop, i) => {
    var classes = "mr6 inline-block align-middle"
    if (stop[4] == "round-full") {
      classes = classes.concat(" round-full")
    }

    return (
      <div key={i} className="txt-s">
        <span
          className={classes}
          style={{ backgroundColor: stop[1], width: stop[3], height: stop[2] }}
        />
        <span>{`${stop[0].toLocaleString()}`}</span>
      </div>
    )
  }

  function SpecificLegend(props) {
    const id = props.id
    const mr = props.mr
    const mb = 28
    return (
      <div
        className="absolute bottom right py12 px12 shadow-darken10 round z1 wmax180"
        style={{
          marginRight: mr,
          marginBottom: mb,
          backgroundColor: "#ffffff95"
        }}
      >
        <div className="mb6">
          <h2 className="txt-bold txt-m block">{options[id].name}</h2>
          <p className="txt-s color-black">{options[id].description}</p>
        </div>
        {options[id].stops.map(renderLegendKeys)}
      </div>
    )
  }

  function Legends() {
    if (activeSR && !activeWN && !activeCT) {
      return (
        <div>
          <SpecificLegend id={0} mr={9} />
        </div>
      )
    } else if (!activeSR && activeWN && !activeCT) {
      return (
        <div>
          <SpecificLegend id={1} mr={9} />
        </div>
      )
    } else if (!activeSR && !activeWN && activeCT) {
      return (
        <div>
          <SpecificLegend id={2} mr={9} />
        </div>
      )
    } else if (activeSR && activeWN && !activeCT) {
      return (
        <div>
          <SpecificLegend id={0} mr={9} />
          <SpecificLegend id={1} mr={198} />
        </div>
      )
    } else if (!activeSR && activeWN && activeCT) {
      return (
        <div>
          <SpecificLegend id={1} mr={198} />
          <SpecificLegend id={2} mr={9} />
        </div>
      )
    } else if (activeSR && !activeWN && activeCT) {
      return (
        <div>
          <SpecificLegend id={0} mr={9} />
          <SpecificLegend id={2} mr={198} />
        </div>
      )
    } else if (activeSR && activeWN && activeCT) {
      return (
        <div>
          <SpecificLegend id={0} mr={9} />
          <SpecificLegend id={1} mr={388} />
          <SpecificLegend id={2} mr={198} />
        </div>
      )
    } else if (!activeSR && !activeWN && !activeCT) {
      return null
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
              <ButtonGroup
                orientation="vertical"
                color="primary"
                aria-label="vertical contained primary button group"
                variant="contained"
                style={{ marginLeft: 49, marginTop: 15 }}
              >
                <StyledButton
                  color={"primary"}
                  onClick={clickExport}
                  startIcon={<GetAppIcon style={{ fill: "#252525" }} />}
                  endIcon={<GetAppIcon style={{ fill: "#252525" }} />}
                  disabled={disableSR}
                  className={classes.export}
                >
                  Export
                </StyledButton>
              </ButtonGroup>
            </CardContent>
          </Card>
          <Legends />
          <div className={classes.loading}>{loading && <LinearProgress />}</div>
        </ThemeProvider>
      </div>
    </div>
  )
}

export default MapboxGLMap
