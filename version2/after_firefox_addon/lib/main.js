var panel = require("panel").Panel({
  contentURL: require("self").data.url("myFile.html")
});

panel.show();