const express = require("express");
const app = express();
const port = process.env.PORT || 8080; // Use process.env.PORT for containerized apps

app.get("/", (req, res) => {
  res.send("Hello from Healthcare Node.js Backend on GKE! Yos");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(port, () => {
  console.log(`Node.js backend listening on port ${port}`);
});
