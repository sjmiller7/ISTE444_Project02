// Neo4j connection
var neo4j = require('neo4j-driver');
require('dotenv').config();

// For auth
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// DB connection
try {
    var driver = neo4j.driver(
        'neo4j://localhost',
        neo4j.auth.basic(process.env.USER, process.env.PASSWORD)
      );
    console.log('Database connection estabilished');
  } catch(err) {
    console.error(`ERROR: Database connection error\n${err}\nCause: ${err.cause}`);
  }

// Connection test endpoint
exports.test = async function (req, res) {
    console.log("\n\nTest endpoint\n");
    // Make session
    var session = driver.session({database: 'neo4j'});
    session
    // Run query
    .run(
        'MATCH (test:Test {name : $nameParam}) RETURN test.name AS name', 
        {nameParam: 'Test worked!'}
    )
    // Parse & send results
    .then(result => {
        var testResult = result.records[0].get('name');
        console.log("Result: " + testResult);
        return res.send(JSON.stringify({test: testResult}));
    })
    // Catch errors
    .catch(error => {
        console.error('ERROR: ' + error);
    })
    // Close session
    .then(() => session.close())
  };

// Authentication endpoint
exports.enter = async function (req, res) {
  console.log(req.body.username);
  var session = driver.session({database: 'neo4j'});
  session
  .run(
      'MATCH (you:User {username : $username}) RETURN you.password AS password', 
      {username: req.body.username}
  )
  .then(result => {
      var hash = result.records[0].get('password');
      bcrypt
      .compare(req.body.password, hash)
      .then(match => {
        console.log(match);
        var token = jwt.sign({ username: req.body.username }, process.env.SECRET);
        return res.send(JSON.stringify({match:match, token: token}));
      })
      .catch(err => console.error(err.message)) 
  })
  .catch(error => {
      console.log(error)
  })
  .then(() => session.close())
};