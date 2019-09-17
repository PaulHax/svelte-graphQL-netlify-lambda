#!/usr/bin/env node

/* sync GraphQL schema to your FaunaDB account - use with 
netlify dev:exec functions\graphQLEndpoint\sync-schema.js 
*/
function createFaunaGraphQL() {
  if (!process.env.FAUNADB_FUNCTIONS_SECRET) {
    console.log("No FAUNADB_FUNCTIONS_SECRET in environment, skipping DB setup");
  }
  console.log("Uploading GraphQL Schema!");

  const fetch = require("node-fetch");
  const fs = require("fs");
  const path = require("path");
  var dataString = fs
    .readFileSync(path.join(__dirname, "schema.graphql"))
    .toString(); // name of your schema file

  // encoded authorization header similar to https://www.npmjs.com/package/request#http-authentication
  const token = Buffer.from(
    process.env.FAUNADB_FUNCTIONS_SECRET + ":"
  ).toString("base64");

  var options = {
    method: "POST",
    body: dataString,
    headers: { Authorization: `Basic ${token}` }
  };

  // fetch("https://graphql.fauna.com/import", options)
  fetch("https://graphql.fauna.com/import?mode=override", options)  
    // // uncomment for debugging
    .then(res => res.text())
    .then(body => {
      // console.log(
      //   "Netlify Functions:Create - `graphql/sync-schema.js` success!"
      // );
      console.log("body " + body);
    })
    .catch(err => console.error("something wrong happened: ", { err }));
}

createFaunaGraphQL();