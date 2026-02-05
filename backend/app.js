const express = require("express");
const cors = require("cors");
const app = express();
require("./db");

app.use(cors());
app.use(express.json());
app.use("/api", require("./routes/tripRoutes"));

app.listen(5000, () => console.log("Server started"));
