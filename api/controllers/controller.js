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
        return res.send(JSON.stringify({match: match, token: token, username: req.body.username}));
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
  log.log('info', req.query.username, '/gallery/view', "View all endpoint");
  // Params
  log.log('info', req.query.username, '/gallery/view', "Username: " + req.query.username);
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
      var id = -1;
      // Handling ids because they are so dumb
      if (typeof record.get('id').low !== 'undefined') {
        id = record.get('id').low;
      }
      else {
        id = record.get('id');
      }
      resultJSON.art.push({
        name: record.get('name'),
        img: record.get('img'),
        artist: record.get('artist'),
        id: id,
        created: record.get('created'),
        gallery: record.get('gallery')
      });
    })
    // Log # of records
    log.log('info', req.query.username, '/gallery/view', resultJSON.art.length + " records found");
    // Send records
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.query.username, '/gallery/view', error)
  })
  // Close session
  .then(() => session.close())
};

// View one endpoint
exports.viewOne = async function (req, res) {
  // Log endpoint
  log.log('info', req.query.username, '/gallery/view/' + req.params.artID, "View one endpoint");
  // Params
  log.log('info', req.query.username, '/gallery/view/' + req.params.artID, "Username: " + req.query.username);
  log.log('info', req.query.username, '/gallery/view/' + req.params.artID, "Art piece: " + req.params.artID);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (artist:Artist)-[created:CREATED]->(art:Art)-[located:LOCATED_IN]-(gallery:Gallery) WHERE art.id = $artID RETURN located, artist, created, art, gallery',
      {artID: parseInt(req.params.artID)}
  )
  // Process & send result
  .then(result => {
    // Convert to better JSON formatting
    var resultJSON = {
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
          country: result.records[0].get('gallery').properties.country,
          since: result.records[0].get('located').properties.since
        }
      }
    // Handling ids because they are so dumb
    if (result.records[0].get('art').properties.id.low) {
      resultJSON.id = result.records[0].get('art').properties.id.toNumber();
    }
    else {
      resultJSON.id = result.records[0].get('art').properties.id;
    }
      
    // Log name of art
    log.log('info', req.query.username, '/gallery/view/' + req.params.artID, "Retrieved info on '" + resultJSON.name + "'");
    // Send records
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.query.username, '/gallery/view/' + req.params.artID, error)
  })
  // Close session
  .then(() => session.close())
};

// Donate (create) endpoint
exports.donate = async function (req, res) {
  // Log endpoint
  log.log('info', req.body.username, '/gallery/donate', "Donate endpoint");
  // Params
  log.log('info', req.body.username, '/gallery/donate', "Username: " + req.body.username);
  log.log('info', req.body.username, '/gallery/donate', "Artist: " + req.body.artistID);
  log.log('info', req.body.username, '/gallery/donate', "Gallery: " + req.body.galleryID);
  log.log('info', req.body.username, '/gallery/donate', "Created year: " + req.body.created);
  log.log('info', req.body.username, '/gallery/donate', "Since: " + req.body.since);
  log.log('info', req.body.username, '/gallery/donate', "Art properties: " + req.body.artProperties);

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
    // Handling ids because they are so dumb
    if (typeof result.records[0].get('highest').low !== 'undefined') {
      newid = result.records[0].get('highest').low;
    }
    else {
      newid = result.records[0].get('highest');
    }
    newid += "";
    req.body.artProperties.id = parseInt(newid) + 1;
    log.log('info', req.body.username, '/gallery/donate', "New record id: " + req.body.artProperties.id);
    
    // New session for new query
    var session2 = driver.session({database: 'neo4j'});
    session2
    // Run query
    .run(
        'MATCH (artist:Artist {id: $artistID}) MATCH (gallery:Gallery {id: $galleryID}) CREATE (artist)-[created:CREATED {year: $created}]->(art:Art $artProperties)-[located:LOCATED_IN {since: $since}]->(gallery) RETURN art, artist, created, located, gallery',
        {
          artistID: req.body.artistID,
          galleryID: req.body.galleryID,
          created: req.body.created,
          since: req.body.since,
          artProperties: req.body.artProperties
        }
    )
    // Process & send result
    .then(result => {
      // Convert to better JSON formatting
      var resultJSON = {
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
            country: result.records[0].get('gallery').properties.country,
            since: result.records[0].get('located').properties.since
          }
        }
      // Handling ids because they are so dumb
      if (result.records[0].get('art').properties.id.low) {
        resultJSON.id = result.records[0].get('art').properties.id.toNumber();
      }
      else {
        resultJSON.id = result.records[0].get('art').properties.id;
      }
      // Log name of art
      log.log('info', req.body.username, '/gallery/donate', "Created '" + resultJSON.name + "'");
      // Send records
      res.send(JSON.stringify(resultJSON));
    })
    // Catch errors
    .catch(error => {
        log.log('error', req.body.username, '/gallery/donate', error)
    })
    // Close session
    .then(() => session2.close())
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.body.username, '/gallery/donate', error)
  })
  // Close session
  .then(() => session.close())
};

// Curate (update) endpoint
exports.curate = async function (req, res) {
  // Log endpoint
  log.log('info', req.body.username, '/gallery/curate', "Curate endpoint");
  // Params
  log.log('info', req.body.username, '/gallery/curate', "Username: " + req.body.username);
  log.log('info', req.body.username, '/gallery/curate', "Art: " + req.body.artProperties.id);
  log.log('info', req.body.username, '/gallery/curate', "Artist: " + req.body.artistID);
  log.log('info', req.body.username, '/gallery/curate', "Gallery: " + req.body.galleryID);
  log.log('info', req.body.username, '/gallery/curate', "Created year: " + req.body.created);
  log.log('info', req.body.username, '/gallery/curate', "Since: " + req.body.since);
  log.log('info', req.body.username, '/gallery/curate', "Art properties: " + req.body.artProperties);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (newArtist:Artist {id: $artistID}) ' +
      'MATCH (newGallery:Gallery {id: $galleryID}) ' +
      'MATCH (oldArtist:Artist)-[oldCreated:CREATED]->(art:Art {id: $artID})-[oldLocated:LOCATED_IN]->(oldGallery:Gallery) ' +
      'CALL { ' +
          'WITH newArtist, oldArtist, oldCreated, art ' +
          'WITH newArtist, oldArtist, oldCreated, art ' +
          'WHERE oldArtist.id <> newArtist.id ' +
          'DELETE oldCreated ' +
          'CREATE (newArtist)-[createdBy:CREATED {year: $created}]->(art) ' +
          'RETURN createdBy ' +
          'UNION ' +
          'WITH newArtist, oldArtist, oldCreated, art ' +
          'WITH newArtist, oldArtist, oldCreated, art ' +
          'WHERE oldArtist.id = newArtist.id ' +
          'SET oldCreated.year = $created ' +
          'RETURN oldCreated as createdBy ' +
      '} ' +
      'CALL { ' +
          'WITH newGallery, oldGallery, oldLocated, art ' +
          'WITH newGallery, oldGallery, oldLocated, art ' +
          'WHERE oldGallery.id <> newGallery.id ' +
          'DELETE oldLocated ' +
          'CREATE (newGallery)<-[locatedIn:LOCATED_IN {since: $since}]-(art) ' +
          'RETURN locatedIn ' +
          'UNION ' +
          'WITH newGallery, oldGallery, oldLocated, art ' +
          'WITH newGallery, oldGallery, oldLocated, art ' +
          'WHERE oldGallery.id = newGallery.id ' +
          'SET oldLocated.since = $since ' +
          'RETURN oldLocated as locatedIn ' +
      '} ' +
      'SET art = $artProperties ' +
      'WITH art ' +
      'MATCH (artist:Artist)-[created:CREATED]->(art)-[located:LOCATED_IN]-(gallery:Gallery) RETURN located, artist, created, art, gallery',
      {
        artID: req.body.artProperties.id,
        artistID: req.body.artistID,
        galleryID: req.body.galleryID,
        created: req.body.created,
        since: req.body.since,
        artProperties: req.body.artProperties
      }
  )
  // Process & send result
  .then(result => {
    // Convert to better JSON formatting
    var resultJSON = {
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
          country: result.records[0].get('gallery').properties.country,
          since: result.records[0].get('located').properties.since
        }
      }
    // Handling ids because they are so dumb
    if (result.records[0].get('art').properties.id.low) {
      resultJSON.id = result.records[0].get('art').properties.id.toNumber();
    }
    else {
      resultJSON.id = result.records[0].get('art').properties.id;
    }
    // Log name of art
    log.log('info', req.body.username, '/gallery/curate', "Updated '" + resultJSON.name + "'");
    // Send records
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.body.username, '/gallery/curate', error)
  })
  // Close session
  .then(() => session.close())
};

// Steal (delete) endpoint
exports.steal = async function (req, res) {
  // Log endpoint
  log.log('info', req.body.username, '/gallery/steal', "Steal endpoint");
  // Params
  log.log('info', req.body.username, '/gallery/steal', "Username: " + req.body.username);
  log.log('info', req.body.username, '/gallery/steal', "Art piece: " + req.body.artID);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (art:Art {id: $artID}) DETACH DELETE art',
      {artID: req.body.artID}
  )
  // Process & send result
  .then(result => {
    // Convert to better JSON formatting
    var resultJSON = {
      deleted: true    
    }
      
    // Log success
    log.log('info', req.body.username, '/gallery/steal', "Art piece deleted");
    // Send result
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.body.username, '/gallery/steal', error)
  })
  // Close session
  .then(() => session.close())
};

// Get all galleries endpoint 
exports.galleries = async function (req, res) {
  // Log endpoint
  log.log('info', req.query.username, '/gallery/galleries', "Get galleries endpoint");
  // Params
  log.log('info', req.query.username, '/gallery/galleries', "Username: " + req.query.username);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (gallery:Gallery) RETURN gallery.name as name, gallery.id as id'
  )
  // Process & send result
  .then(result => {
    // Convert to better JSON formatting
    var resultJSON = { galleries: []};
    result.records.forEach(record => {
      var id = -1;
      // Handling ids because they are so dumb
      if (typeof record.get('id').low !== 'undefined') {
        id = record.get('id').low;
      }
      else {
        id = record.get('id');
      }
      resultJSON.galleries.push({
        name: record.get('name'),
        id: id
      });
    })
    // Log # of records
    log.log('info', req.query.username, '/gallery/galleries', resultJSON.galleries.length + " records found");
    // Send records
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.query.username, '/gallery/galleries', error)
  })
  // Close session
  .then(() => session.close())
};

// Get all galleries endpoint 
exports.artists = async function (req, res) {
  // Log endpoint
  log.log('info', req.query.username, '/gallery/artists', "Get artists endpoint");
  // Params
  log.log('info', req.query.username, '/gallery/artists', "Username: " + req.query.username);
  // Make session
  var session = driver.session({database: 'neo4j'});
  session
  // Run query
  .run(
      'MATCH (artist:Artist) RETURN artist.name as name, artist.id as id'
  )
  // Process & send result
  .then(result => {
    // Convert to better JSON formatting
    var resultJSON = { artists: []};
    result.records.forEach(record => {
      var id = -1;
      // Handling ids because they are so dumb
      if (typeof record.get('id').low !== 'undefined') {
        id = record.get('id').low;
      }
      else {
        id = record.get('id');
      }
      resultJSON.artists.push({
        name: record.get('name'),
        id: id
      });
    })
    // Log # of records
    log.log('info', req.query.username, '/gallery/artists', resultJSON.artists.length + " records found");
    // Send records
    res.send(JSON.stringify(resultJSON));
  })
  // Catch errors
  .catch(error => {
      log.log('error', req.query.username, '/gallery/artists', error)
  })
  // Close session
  .then(() => session.close())
};
