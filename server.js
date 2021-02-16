const express = require("express");
const env = require("dotenv").config();
const path = require("path");
const schemas = require('./validation/schema'); 
const usersRoutes = require("./routes/user.routes");
const auth = require("./routes/auth");
const app = express();
const db = require("./models/index");
const cors = require('cors');

//console.log(process.env.NODE_ENV)
if (!process.env.jwtPrivateKey) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", usersRoutes);
app.use("/api/auth", auth);

db.sequelize.sync();

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, console.log(`Server started on port ${PORT}`));
module.exports = server;
