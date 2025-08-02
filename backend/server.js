const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const cron = require('node-cron');
const prisma = require('./prisma')

const teachroute = require("./routes/teachersRoutes")
const comproutes = require("./routes/compRoutes")
const studentroute = require("./routes/studentRoutes");
const teamroute=require("./routes/teamRoutes")
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
app.use("/api/team",teamroute)
app.use("/api/analytics", analyticsroute);



// to automatically set completd status for competions
// Run daily at 9:00 AM
cron.schedule('20 14 * * *', async () => {
  const now = new Date();

  try {
    // 1. COMPLETED
    const completed = await prisma.competition.updateMany({
      where: {
        enddate: { lt: now },
        status: { not: 'COMPLETED' }
      },
      data: { status: 'COMPLETED' }
    });

    // 2. ONGOING
    const ongoing = await prisma.competition.updateMany({
      where: {
        startdate: { lte: now },
        enddate: { gte: now },
        status: { not: 'ONGOING' }
      },
      data: { status: 'ONGOING' }
    });

    // 3. REGISTRATION_OPEN
    const registrationOpen = await prisma.competition.updateMany({
      where: {
        deadline: { gte: now },
        startdate: { gt: now }, // optionally check that it hasn't started yet
        status: { notIn: ['ONGOING', 'COMPLETED', 'REGISTRATION_OPEN'] }
      },
      data: { status: 'REGISTRATION_OPEN' }
    });

    console.log(`[${now.toLocaleString()}] Competitions updated:`);
    if (completed.count) console.log(`✔ ${completed.count} marked as COMPLETED`);
    if (ongoing.count) console.log(`✔ ${ongoing.count} marked as ONGOING`);
    if (registrationOpen.count) console.log(`✔ ${registrationOpen.count} marked as REGISTRATION_OPEN`);
  } catch (error) {
    console.error('Error updating competition statuses:', error);
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
