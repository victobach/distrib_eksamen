const express = require("express");
const formData = require("express-form-data");
const db = require("./controller/db");
const fs = require("fs");
const { Console } = require("console");

//listening on port 8000
const app = express();
const PORT = 8000;

module.exports = app.listen(PORT, () => {
  console.log(`Server active through port: ${PORT}`);
});

// Middleware
app.use(express.json());
app.use(formData.parse({ uploadDir: "./images" }));
app.use("/images", express.static("images"));
app.use("/", express.static("Views"));
// DB connection
async function connectToDb() {
  try {
    await db.startDb();
  } catch (error) {
    console.log("Couldnt connect to the database", error.message);
  }
}

connectToDb();

//Creates new user and adds it to db
app.post("/register", async function (req, res) {
  try {
    let userData = {
      userName: req.body.userName,
      password: req.body.password,
    };
    await db.uploadUser(userData);
    res.status(200).json(userData);
  } catch (err) {
    res.status(400).json("upload failed");
  }
});

//creates session in database
app.post("/session", async function (req, res) {
  try {
    let session = req.body;
    await db.createSession(session);
    res.status(200).json("Session created");
  } catch {
    res.status(400).json("Internal error");
    console.log("Session couldnt be created");
  }
});

//validates user credentials in database
app.post("/login", async function (req, res) {
  try {
    let userName = req.body.userName;
    let password = req.body.password;
    await db.validateUser(userName, password);
    res.status(200).json("sign in successful");
  } catch {
    res.status(400).json("wrong info");
  }
});

//Checks for current session in database
app.post("/checkSession", async function (req, res) {
  try {
    await db.validateSession(req.body);
    res.status(200).json("User active in session");
  } catch {
    res.status(400).json("No current Session");
  }
});

//Ends session
app.delete("/endSession", async function (req, res) {
  try {
    await db.endSession(req.body);
    res.status(200).json("Account logged out");
  } catch {
    res.status(400).json("Wrong info, account could not be logged out");
  }
});
