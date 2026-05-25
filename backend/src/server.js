require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Connected Successfully");
});
// ROUTES
const authRoutes = require("./routes/auth.routes");

const reportRoutes = require("./routes/report.routes");

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

