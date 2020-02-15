import React, { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

const styles = {
  width: "100vw",
  height: "calc(100vh - 80px)",
  position: "absolute"
}

const MapboxGLMap = () => {
  const [map, setMap] = useState(null)
  const [lat, setLat] = useState(34)
  const [lng, setLng] = useState(40)
  const [zoom, setZoom] = useState(2)
  const mapContainer = useRef(null)

  useEffect(() => {
    console.log(process.env.REACT_APP_MAPBOX_KEY)
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
        center: [lng, lat],
        zoom: zoom
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
