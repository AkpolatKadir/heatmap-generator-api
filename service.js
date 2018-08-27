const Service = require("node-windows").Service;
const EventLogger = require("node-windows").EventLogger;

// Create a new service object
const heatmapService = new Service({
  name: "Heatmap Generator",
  description: "The Heatmap Generator Application.",
  script: require("path").join(__dirname, "\\bin\\www")
});

const log = new EventLogger("Heatmap Generator");

console.log(require("path").join(__dirname, "\\bin\\www"));

// Listen for the "install" event, which indicates the
// process is available as a service.
heatmapService.on("install", () => {
  heatmapService.start();
  console.log("Heatmap service is installed succesfully!");
});

heatmapService.on("start", () => {
  console.log("Heatmap service is started");
  log.info("Heatmap service is started.");
});

heatmapService.on("stop", () => {
  console.log("Heatmap service is stopped");
  log.info("Heatmap service is stopped.");
});

heatmapService.on("alreadyinstalled", () => {
  console.log("Heatmap Service is already installed!");
  log.warn("Heatmap Service is already installed!");
});

heatmapService.on("error", e => {
  console.log("Heatmap Service error!");
  log.error("Heatmap Service error!");
});

heatmapService.on("uninstall", () => {
  console.log("Heatmap Service is uninstalled succesfully!");
});

heatmapService.install();
