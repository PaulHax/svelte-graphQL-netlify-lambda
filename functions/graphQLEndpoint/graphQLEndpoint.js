const { ApolloServer } = require("apollo-server-lambda");
const { createHttpLink } = require("apollo-link-http");
const fetch = require("node-fetch");
const { makeRemoteExecutableSchema } = require("graphql-tools");
const { typeDefs } = require("./schema-build")

exports.handler = async function(event, context) {
  if (!process.env.FAUNADB_FUNCTIONS_SECRET) {
    const msg = `
    FAUNADB_FUNCTIONS_SECRET missing. 
    Did you forget to install the fauna addon or forgot to run inside Netlify Dev?
    `;
    console.error(msg);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg })
    };
  }

  const headers = { Authorization: `Bearer ${process.env.FAUNADB_FUNCTIONS_SECRET}` };

  const link = createHttpLink({
    uri: "https://graphql.fauna.com/graphql",
    fetch,
    headers
  });
  //const schema = await introspectSchema(link);
  const executableSchema = makeRemoteExecutableSchema({
    schema: typeDefs,
    link
  });
  const server = new ApolloServer({
    schema: executableSchema
  });
  return new Promise((yay, nay) => {
    const cb = (err, args) => (err ? nay(err) : yay(args));
    server.createHandler()(event, context, cb);
  });
};


// CreateIndex({
//   name: "msgs_latest_first",
//   source: Collection("Message"),
//   values: [{ field: ["ts"], reverse: true },
//         {field: ["data", "author"] },
//         {field: ["data", "text"] }
//       ]
// })
