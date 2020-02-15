import React from "react"
import mapboxgl from "mapbox-gl"
import MapboxGLMap from "./MapboxGLMap.js"
import logo from "./logo.svg"
import "./App.css"

mapboxgl.accessToken = ""

function App() {
  return <MapboxGLMap />
}

export default App
