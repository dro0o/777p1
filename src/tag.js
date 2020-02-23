import tag from "@turf/tag"

export const tagStuff = (points, tracts) => {
  var tagged = tag(points, tracts, "canrate", "canrate")

  postMessage(tagged)
}
