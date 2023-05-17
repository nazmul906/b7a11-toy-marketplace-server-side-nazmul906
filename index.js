const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
// middleware
app.use(cors());
app.use(express());

app.get("/", (req, res) => {
  res.send("Helen of Toy");
});

app.listen(port, (req, res) => {
  console.log(`port is runnig on ${port}`);
});
