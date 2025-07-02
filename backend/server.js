const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const PORT = process.env.PORT || 4000;


const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/",(req,res)=>{
    res.send("api working");
})


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});