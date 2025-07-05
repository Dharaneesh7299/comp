const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const teachroute = require("./routes/teachersRoutes");
const studentroute = require("./routes/studentRoutes");

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API working");
});

app.use("/api/teacher", teachroute);
app.use("/api/student", studentroute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
