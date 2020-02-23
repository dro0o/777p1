import interpolate from "@turf/interpolate"

export const aggregateStuff = (points, size, options) => {
  var test = interpolate(points, size, options)

  console.log("reg: ", test, " type: ", options.property)
  postMessage(test)
}
