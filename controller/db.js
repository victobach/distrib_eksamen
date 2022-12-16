//imports
const { reject } = require("lodash");
const { resolve } = require("path");
const { Connection, Request, TYPES } = require("tedious");
const config = require("../config.json");
const bcrypt = require("bcrypt");

// DB functions. Source: Nicolai Frost https://www.youtube.com/watch?v=Nry_sp_JSOU
//Starts connection
var connection = new Connection(config);
function startDb() {
  return new Promise((resolve, reject) => {
    connection.on("connect", (err) => {
      if (err) {
        console.log("Connection failed");
        reject(err);
        throw err;
      } else {
        console.log("Connected");
        resolve();
      }
    });
    connection.connect();
  });
}
module.exports.sqlConnection = connection;
module.exports.startDb = startDb;

//

//Uploads user to database
function uploadUser(userData) {
  return new Promise((resolve, reject) => {
    //bcrypt snippet inspiration from: web dev simplified https://www.youtube.com/watch?v=Ud5xKCYQTjM
    bcrypt.hash(userData.password, 10, function (err, password) {
      if (err) {
        reject(err);
      }
      // store hash in the database
      const sqlQuery =
        "INSERT INTO [dbo].[users] (userName, password) VALUES (@userName, @password)";
      const request = new Request(sqlQuery, (err) => {
        if (err) {
          reject(err);
          console.log(err);
        }
      });
      request.addParameter("userName", TYPES.VarChar, userData.userName);
      request.addParameter("password", TYPES.VarChar, password);
      request.on("requestCompleted", (row) => {
        resolve("successfully added:", row);
      });
      connection.execSql(request);
    });
  });
}
module.exports.uploadUser = uploadUser;

//creates session
function createSession(sessionData) {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "INSERT INTO [dbo].[sessions] (userName, token) VALUES (@userName, @token)";
    const request = new Request(sqlQuery, (err) => {
      if (err) {
        reject(err);
        console.log(err);
      }
    });
    request.addParameter("userName", TYPES.VarChar, sessionData.userName);
    request.addParameter("token", TYPES.VarChar, sessionData.token);

    request.on("requestCompleted", (row) => {
      resolve("successfully added:", row);
    });
    connection.execSql(request);
  });
}
module.exports.createSession = createSession;

//validates login credentials
function validateUser(userName, password) {
  return new Promise((resolve, reject) => {
    const sqlQuery = "SELECT * FROM [dbo].[users] where userName = @userName";
    const request = new Request(sqlQuery, (err, rowcount) => {
      if (err) {
        reject(err);
        console.log(err);
      } else if (rowcount == 0) {
        reject({ message: "user invalid" });
      }
    });
    request.addParameter("userName", TYPES.VarChar, userName);
    request.on("row", (columns) => {
      //compares hashed password with unhashed password
      const hashedPassword = columns[1].value;
      bcrypt.compare(password, hashedPassword, function (err, accepted) {
        if (err) {
          reject(err);
        } else {
          if (accepted == false) {
            reject({ message: "user invalid" });
          } else {
            resolve(accepted);
          }
        }
      });
    });
    connection.execSql(request);
  });
}
module.exports.validateUser = validateUser;

//checks for current session
function validateSession(session) {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "SELECT * FROM [dbo].[sessions] where userName = @userName AND token = @token";
    const request = new Request(sqlQuery, (err, rowcount) => {
      if (err) {
        reject(err);
        console.log(err);
      } else if (rowcount == 0) {
        reject({ message: "no current session" });
      }
    });
    request.addParameter("userName", TYPES.VarChar, session.userName);
    request.addParameter("token", TYPES.VarChar, session.token);
    request.on("row", (columns) => {
      //resolves with session data
      resolve([columns[0].value, columns[1].value]);
    });
    connection.execSql(request);
  });
}
module.exports.validateSession = validateSession;

function endSession(session) {
  return new Promise((resolve, reject) => {
    const sqlQuery =
      "DELETE FROM [dbo].[sessions] where userName = @userName AND token = @token";
    const request = new Request(sqlQuery, (err, rowcount) => {
      if (err) {
        reject(err);
        console.log(err);
      } else if (rowcount == 0) {
        reject({ message: "user invalid" });
      }
    });
    request.addParameter("userName", TYPES.VarChar, session.userName);
    request.addParameter("token", TYPES.VarChar, session.token);
    request.on("requestCompleted", (columns) => {
      resolve("user logged out", columns);
    });
    connection.execSql(request);
  });
}
module.exports.endSession = endSession;
