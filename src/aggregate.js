import interpolate from "@turf/interpolate"

export const aggregateStuff = (points, size, options) => {
  var test = interpolate(points, size, options)

  postMessage(test)
}
