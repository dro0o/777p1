import React, { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import shp from "shpjs"

const styles = {
  width: "100vw",
  height: "calc(100vh - 64px)",
  position: "absolute"
}

// Import shapefile zips
shp(process.env.PUBLIC_URL + "/shp/well_nitrate.zip").then(
  function(geojsonWellNitrate) {
    console.log("well nitrate: ", geojsonWellNitrate)
  },
  function(err) {
    console.log("error:", err)
  }
)
shp(process.env.PUBLIC_URL + "/shp/cancer_county.zip").then(
  function(geojsonCancerCounty) {
    console.log("cancer county: ", geojsonCancerCounty)
  },
  function(err) {
    console.log("error:", err)
  }
)
shp(process.env.PUBLIC_URL + "/shp/cancer_tracts.zip").then(
  function(geojsonCancerTracts) {
    console.log("cancer tracts: ", geojsonCancerTracts)
  },
  function(err) {
    console.log("error:", err)
  }
)

const MapboxGLMap = () => {
  const [map, setMap] = useState(null)
  const [lat, setLat] = useState(44.5)
  const [lng, setLng] = useState(-90)
  const [zoom, setZoom] = useState(6.5)
  const mapContainer = useRef(null)

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY
    const initializeMap = ({ setMap, mapContainer }) => {
      var bounds = [
        [-95, 40], // Southwest coordinates
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

      map.on("load", () => {
        setMap(map)
        map.resize()
      })
    }

    if (!map) initializeMap({ setMap, mapContainer })
  }, [map])

  return <div ref={el => (mapContainer.current = el)} style={styles} />
}

export default MapboxGLMap
