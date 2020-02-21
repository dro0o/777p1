import interpolate from "@turf/interpolate"
import geomEach from "@turf/meta"
import intersect from "@turf/intersect"

export const calcStuff = (points, size, options) => {
  postMessage(interpolate(points, size, options))
}
