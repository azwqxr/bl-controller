const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ---------- STATE ----------
let state = {
  dayNight: "day",
  light: "auto",
  door: "closed",
  invert: false,
  autoMode: { type: "interval", intervalSeconds: 500 },
};

// ---------- PIN STRING BUILDER ----------
function buildPinString() {
  let pins = [
    state.dayNight === "day",     // pin 1
    state.dayNight === "night",   // pin 2
    state.light === "on",         // pin 3
    state.light === "off",        // pin 4
    state.light === "auto",       // pin 5
    state.door === "open",        // pin 6
    state.door === "closed"       // pin 7
  ];

  if (state.invert) pins = pins.map(v => !v);
  return pins.map(v => (v ? "1" : "0")).join("");
}

// ---------- API for Roblox ----------
app.get("/api", (req, res) => {
  res.json({ value: buildPinString() });
});

// ---------- PANEL ----------
// Serve HTML
app.get("/panel", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "panel.html"));
});

// Return panel state for JS
app.get("/panel/state", (req, res) => {
  res.json(state);
});

// Receive changes from panel
app.post("/panel/state", (req, res) => {
  const data = req.body;
  if (data.dayNight) state.dayNight = data.dayNight;
  if (data.light) state.light = data.light;
  if (data.door) state.door = data.door;
  if (typeof data.invert === "boolean") state.invert = data.invert;
  if (data.autoMode) {
    if (data.autoMode.type) state.autoMode.type = data.autoMode.type;
    if (data.autoMode.intervalSeconds) state.autoMode.intervalSeconds = Number(data.autoMode.intervalSeconds);
  }
  res.json({ success: true });
});

// ---------- AUTO DAY/NIGHT ----------
setInterval(() => {
  if (state.dayNight !== "auto") return;

  if (state.autoMode.type === "interval") {
    state._toggle = !state._toggle;
    state.dayNight = state._toggle ? "day" : "night";
  }

  if (state.autoMode.type === "utc") {
    const hour = new Date().getUTCHours();
    state.dayNight = hour >= 6 && hour < 18 ? "day" : "night";
  }
}, 1000);

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
