const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const teachroute = require("./routes/teachersRoutes")
const comproutes = require("./routes/compRoutes")
const studentroute = require("./routes/studentRoutes");
const analyticsroute = require("./routes/analyticsRoutes");

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API working");
});


app.use("/api/comp",comproutes);
app.use("/api/teacher", teachroute);
app.use("/api/student", studentroute);
app.use("/api/analytics", analyticsroute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
