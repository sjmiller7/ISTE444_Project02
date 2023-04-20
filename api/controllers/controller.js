// Neo4j connection
var neo4j = require('neo4j-driver');
require('dotenv').config();

try {
    var driver = neo4j.driver(
        'neo4j://localhost',
        neo4j.auth.basic(process.env.USER, process.env.PASSWORD)
      );
    console.log('Connection estabilished')
  } catch(err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
  }

exports.test = async function (req, res) {
    var session = driver.session({database: 'neo4j'});
    session
    .run(
        'MATCH (test:Test {name : $nameParam}) RETURN test.name AS name', 
        {nameParam: 'Test worked!'}
    )
    .then(result => {
        var testResult = result.records[0].get('name');
        console.log("Test endpoint: " + testResult);
        return res.send(JSON.stringify({test: testResult}));
    })
    .catch(error => {
        console.log(error)
    })
    .then(() => session.close())
  };