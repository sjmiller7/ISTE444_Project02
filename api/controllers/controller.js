// Neo4j connection
var neo4j = require('neo4j-driver');
require('dotenv').config();

// For auth
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// Logging
const log = require("./logger-wrapper.js");

// DB connection
try {
    var driver = neo4j.driver(
        'neo4j://localhost',
        neo4j.auth.basic(process.env.USER, process.env.PASSWORD)
      );
    log.log('info', 'system', 'Database connection estabilished');
  } catch(err) {
    log.log('error', 'system', `ERROR: Database connection error\n${err}\nCause: ${err.cause}`);
  }


// Connection test endpoint
exports.test = async function (req, res) {
    log.log('info', 'test-no-user', "Test endpoint (/gallery/test)");
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
        log.log('info', 'test-no-user', "Result: " + testResult);
        return res.send(JSON.stringify({test: testResult}));
    })
    // Catch errors
    .catch(error => {
        log.log('error', 'test-no-user', 'ERROR: ' + error);
    })
    // Close session
    .then(() => session.close())
  };

// Authentication endpoint
exports.enter = async function (req, res) {
  log.log('info', req.body.username, "Auth endpoint (/gallery/enter)");
  log.log('info', req.body.username, "Username: " + req.body.username);
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
        log.log('info', req.body.username, "Password match: " + match);
        var token = jwt.sign({ username: req.body.username }, process.env.SECRET);
        log.log('info', req.body.username, "JWT generated");
        return res.send(JSON.stringify({match:match, token: token}));
      })
      .catch(err => log.log('error', req.body.username, err.message)) 
  })
  .catch(error => {
      log.log('error', req.body.username, error)
  })
  .then(() => session.close())
};