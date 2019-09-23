import Cesium from "./../config/cesium";
const d3TilesUl =
  "http://localhost:9090/webpack-dev-server/public/3d-tiles/tileset.json";

const viererOpts = {
  animation: false,
  timeline: false,
  geocoder: false,
  fullscreenButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  homeButton: false,
  baseLayerPicker: false,
  navigationInstructionsInitiallyVisible: false
  //   creditContainer: "cesium-credit"
};

const viewer = new Cesium.Viewer("cesium-container", viererOpts);

var tileset = new Cesium.Cesium3DTileset({
  url: d3TilesUl
});

tileset.readyPromise
  .then(function(tileset) {
    viewer.scene.primitives.add(tileset);
    viewer.zoomTo(
      tileset,
      new Cesium.HeadingPitchRange(
        0.5,
        -0.2,
        tileset.boundingSphere.radius * 1.0
      )
    );
  })
  .otherwise(function(error) {
    console.log(error);
  });
