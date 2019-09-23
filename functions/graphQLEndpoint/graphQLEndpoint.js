const { ApolloServer } = require('apollo-server-lambda')
const { gql, ApolloClient, InMemoryCache } = require('apollo-boost')
const { createHttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } = require('graphql-tools')
//var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, process.env.SECRET_JWT_TOKEN)
    }
    return null
  } catch (err) {
    return null
  }
}

const generateToken = user => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.SECRET_JWT_TOKEN,
    {
      expiresIn: '1d',
    },
  )
}

exports.handler = async function(event, context) {
  if (!process.env.FAUNADB_FUNCTIONS_SECRET) {
    const msg = `
    FAUNADB_SERVER_SECRET missing. 
    Did you forget to install the fauna addon or forgot to run inside Netlify Dev?
    `
    console.error(msg)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg })
    }
  }
  
  const headers = { Authorization: `Bearer ${process.env.FAUNADB_FUNCTIONS_SECRET}` };

  const link = createHttpLink({
    uri: 'https://graphql.fauna.com/graphql', // modify as you see fit
    fetch,
    headers
  })
  const remoteSchema = await introspectSchema(link)  
  const executableSchema = makeRemoteExecutableSchema({
    schema: remoteSchema,
    link
  })

  const userTypeDefs = `
  type Query {
    GetMyUser(userToken: String): User
  }

  input SignUpInput {    
    username: String!
    password: String
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type Mutation {
    signUp(data: SignUpInput!): AuthResponse!
  }
  `;

const CREATE_USER = gql`
  mutation CreateUser($username: String!) {
    createUser(data: {username: $username, password: null}) {
      _id
      username
    }
  }
`;
  
  const mergedSchema = mergeSchemas({
    schemas: [
      executableSchema,
      userTypeDefs
    ],
    resolvers: {
      Query: {
        GetMyUser(obj, { userToken }, context) {
          const user = getUser(userToken);
          if (user) {
            return { username: user.username }
          }
          return null;
        },
      },
      Mutation: {
        async signUp(_, args, context, info) { //ToDo retry using info.mergeInfo.delegateToSchema
          //const hashedPass = await bcrypt.hash(args.data.password, 10)
          const variables = {
            // password: args.data.name,
            username: args.data.username
          };
          const client = new ApolloClient( { link, cache: new InMemoryCache() } );          
          const response = await client.mutate({ mutation: CREATE_USER, variables });            
          const user = response.data.createUser;
          const token = generateToken(user);
          //delete user.password
          return {
            token: token,
            user: user
          }
        },
      },
    },
  });

  const server = new ApolloServer({
    schema: mergedSchema
  })
  return new Promise((yay, nay) => {
    const cb = (err, args) => (err ? nay(err) : yay(args))
    server.createHandler()(event, context, cb)
  })
}