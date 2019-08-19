const { ApolloServer } = require ('apollo-server-lambda')
const { GraphQLClient } = require ('graphql-request')
const { typeDefs } = require ('./schema')
const {
  MESSAGES,
  CREATE_MESSAGE,
} = require ('./queries');

exports.handler = async function(event, context) {

  const client = new GraphQLClient("https://graphql.fauna.com/graphql", {
    headers: {
      authorization: `Bearer ${process.env.FAUNADB_FUNCTIONS_SECRET}`,
    }
  })


  const resolvers = {
    Query: {
      messages: async (_, args, context) => {
        const response = await client.request(MESSAGES)
        console.log(response)
        return response.messages
      }
    },
    Mutation: {
      createMessage: async (_, args , context) => {
        const { data } = args;
        const response = await client.request(CREATE_MESSAGE, {msgData: data})
        console.log(response)
        return response.createMessage
      }
    }
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers
  })

  //exports.handler = server.createHandler()
  console.log(event)
  return new Promise((yay, nay) => {
    const cb = (err, args) => (err ? nay(err) : yay(args));
    server.createHandler()(event, context, cb);
  });

}