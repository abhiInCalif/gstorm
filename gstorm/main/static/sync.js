var informationFromRemote = false;

var gstormSync = {
  graphChange: function(graph) {
    $("#chart").empty();
    var g = new GStorm(graph);
    g.render();
  }
};

var fireGraphChange = function(graph) {
  if (informationFromRemote) {
      return;
  }
  
  TogetherJS.send({type: "graphChange", graph: graph});
};

TogetherJS.hub.on("graphChange", function (msg) {
  if (! msg.sameUrl) {
    return;
  }
  informationFromRemote = true;
  try {
    gstormSync.graphChange(msg.graph);
  } finally {
    informationFromRemote = false;
  }
});

// TogetherJS.hub.on("togetherjs.hello", function (msg) {
//   if (! msg.sameUrl) {
//     return;
//   }
//   gstormSync.graphChange(msg.graph);
// });