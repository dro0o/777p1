import React from "react"
import ProjectAppBar from "./ProjectAppBar.js"
import MapboxGLMap from "./MapboxGLMap.js"
import logo from "./logo.svg"
import "./App.css"

function App() {
  return (
    <div>
      <ProjectAppBar />
      <MapboxGLMap />
    </div>
  )
}

export default App
