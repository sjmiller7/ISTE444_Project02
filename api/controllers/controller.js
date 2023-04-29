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
    log.log('info', 'system', 'setup', 'Database connection estabilished');
  } catch(err) {
    log.log('error', 'system', 'setup', `ERROR: Database connection error\n${err}\nCause: ${err.cause}`);
  }


// Connection test endpoint
exports.test = async function (req, res) {
    // Log endpoint
    log.log('info', 'test-no-user', '/gallery/test', "Test endpoint");
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
        log.log('info', 'test-no-user', '/gallery/test', "Result: " + testResult);
        return res.send(JSON.stringify({test: testResult}));
    })
    // Catch errors
    .catch(error => {
        log.log('error', 'test-no-user', '/gallery/test', 'ERROR: ' + error);
    })
    // Close session
    .then(() => session.close())
  };

// Authentication endpoint
exports.enter = async function (req, res) {
  // Log endpoint
  log.log('info', req.body.username, '/gallery/enter', "Auth endpoint"); 
  // Params
  log.log('info', req.body.username, '/gallery/enter', "Username: " + req.body.username);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (you:User {username : $username}) RETURN you.password AS password', 
      {username: req.body.username}
  )
  // Parse & send results
  .then(result => {
    // Compare password sent to password stored
      var hash = result.records[0].get('password');
      bcrypt
      .compare(req.body.password, hash)
      .then(match => {
        // Log whether passwords match
        log.log('info', req.body.username, '/gallery/enter', "Password match: " + match);
        // Generate token
        var token = jwt.sign({ username: req.body.username }, process.env.SECRET);
        log.log('info', req.body.username, '/gallery/enter', "JWT generated");
        // Send result and token
        return res.send(JSON.stringify({match: match, token: token}));
      })
      // Catch errors
      .catch(err => log.log('error', '/gallery/enter', req.body.username, err.message)) 
  })
  // Catch errors
  .catch(error => {
      log.log('error', '/gallery/enter', req.body.username, error)
  })
  // Close session
  .then(() => session.close())
};

// View all endpoint
exports.view = async function (req, res) {
  // Log endpoint
  log.log('info', req.body.username, '/gallery/view', "View all endpoint");
  // Params
  log.log('info', req.body.username, '/gallery/view', "Username: " + req.body.username);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (artist:Artist)-[created:CREATED]->(art:Art)-[:LOCATED_IN]-(gallery:Gallery) RETURN artist.name as artist, art.name as name, art.img as img, art.id as id, created.year as created, gallery.name as gallery'
  )
  // Process & send result
  .then(result => {
    // Convert to better JSON formatting
    var resultJSON = { art: []};
    result.records.forEach(record => {
      resultJSON.art.push({
        name: record.get('name'),
        img: record.get('img'),
        artist: record.get('artist'),
        id: record.get('id').low,
        created: record.get('created'),
        gallery: record.get('gallery')
      });
    })
    // Log # of records
    log.log('info', req.body.username, '/gallery/view', resultJSON.art.length + " records found");
    // Send records
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.body.username, '/gallery/view', error)
  })
  // Close session
  .then(() => session.close())
};

// View one endpoint
exports.viewOne = async function (req, res) {
  // Log endpoint
  log.log('info', req.body.username, '/gallery/view/' + req.params.artID, "View one endpoint");
  // Params
  log.log('info', req.body.username, '/gallery/view/' + req.params.artID, "Username: " + req.body.username);
  log.log('info', req.body.username, '/gallery/view/' + req.params.artID, "Art piece: " + req.params.artID);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (artist:Artist)-[created:CREATED]->(art:Art)-[:LOCATED_IN]-(gallery:Gallery) WHERE art.id = $artID RETURN artist, created, art, gallery',
      {artID: parseInt(req.params.artID)}
  )
  // Process & send result
  .then(result => {
    // Convert to better JSON formatting
    log.log('info', req.body.username, '/gallery/view/' + req.params.artID, result);
    var resultJSON = {
        id: result.records[0].get('art').properties.id.low,
        name: result.records[0].get('art').properties.name,
        img: result.records[0].get('art').properties.img,
        style: result.records[0].get('art').properties.style,
        media: result.records[0].get('art').properties.media,
        type: result.records[0].get('art').properties.type,
        created: result.records[0].get('created').properties.year,
        artist: { 
          name: result.records[0].get('artist').properties.name,
          born: result.records[0].get('artist').properties.born,
          died: result.records[0].get('artist').properties.died
        },
        gallery: {
          name: result.records[0].get('gallery').properties.name,
          city: result.records[0].get('gallery').properties.city,
          country: result.records[0].get('gallery').properties.country
        }
      }
    // Log name of art
    log.log('info', req.body.username, '/gallery/view/' + req.params.artID, "Retrieved info on '" + resultJSON.name + "'");
    // Send records
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.body.username, '/gallery/view/' + req.params.artID, error)
  })
  // Close session
  .then(() => session.close())
};

// Donate endpoint
exports.donate = async function (req, res) {
  // Log endpoint
  log.log('info', req.body.username, '/gallery/donate', "Donate endpoint");
  // Params
  log.log('info', req.body.username, '/gallery/donate', "Username: " + req.body.username);
  log.log('info', req.body.username, '/gallery/donate', "Artist: " + req.body.artistID);
  log.log('info', req.body.username, '/gallery/donate', "Gallery: " + req.body.galleryID);
  // Make session
  var session = driver.session({database: 'neo4j'});
  var newid = -1;
  session
  // Run query to generate the next id
  .run(
    'MATCH (art:Art) RETURN art.id AS highest ORDER BY art.id DESC LIMIT 1'
  )
  // Calculate new highest id
  .then(result => {
    newid = result.records[0].get('highest').low + 1;
    log.log('info', req.body.username, '/gallery/donate', "New record id: " + newid);
    
    // New query to actually create node
    session
    // Run query
    .run(
        'MATCH (artist:Artist {}) MATCH CREATE (artist)-[created:CREATED $created]->(art:Art $artProperties)-[:LOCATED_IN]-(gallery) WHERE RETURN art, artist, created, gallery',
        {artID: parseInt(req.params.artID)}
    )
    // Process & send result
    .then(result => {
      // Convert to better JSON formatting
      log.log('info', req.body.username, '/gallery/donate', result);
      var resultJSON = {
          id: result.records[0].get('art').properties.id.low,
          name: result.records[0].get('art').properties.name,
          img: result.records[0].get('art').properties.img,
          style: result.records[0].get('art').properties.style,
          media: result.records[0].get('art').properties.media,
          type: result.records[0].get('art').properties.type,
          created: result.records[0].get('created').properties.year,
          artist: { 
            name: result.records[0].get('artist').properties.name,
            born: result.records[0].get('artist').properties.born,
            died: result.records[0].get('artist').properties.died
          },
          gallery: {
            name: result.records[0].get('gallery').properties.name,
            city: result.records[0].get('gallery').properties.city,
            country: result.records[0].get('gallery').properties.country
          }
        }
      // Log name of art
      log.log('info', req.body.username, '/gallery/donate', "Created '" + resultJSON.name + "'");
      // Send records
      res.send(JSON.stringify(resultJSON));
    })
    // Catch errors
    .catch(error => {
        log.log('error', req.body.username, '/gallery/donate', error)
    });
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.body.username, '/gallery/donate', error)
  })
  // Close session
  .then(() => session.close())
};