const { ApolloServer } = require('apollo-server-lambda')
const { gql, ApolloClient, InMemoryCache } = require('apollo-boost')
const { createHttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')
const { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } = require('graphql-tools')
//var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { getRandomName } = require('./name-factory')

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

const findUserByEmail = gql`
query FindUserByEmail ($email: String!) {
  findUserByEmail(email: $email) {
    _id
    name
  }
}`

const findUserByName = gql`
query FindUserByName ($name: String!) {
  findUserByName(name: $name) {
    _id
    name
  }
}`

const createUser = gql`
mutation CreateUser ($name: String!, $email: String!) {
  createUser(data: {
  name: $name, email: $email
  }) {
    _id
    name
  }
}`

exports.handler = async function(event, lambdaContext) {
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
  type GetMyUserResponse {
    randName: Boolean!
    user: User!
  }

  type Query {
    GetMyUser: GetMyUserResponse
  }
  `;


  
  const mergedSchema = mergeSchemas({
    schemas: [
      executableSchema,
      userTypeDefs
    ],
    resolvers: {
      Query: {
        async GetMyUser(obj, { }, context) { 
          const { user } = lambdaContext.clientContext;
          if (user) {
            const client = new ApolloClient( { link, cache: new InMemoryCache() } );
            //if user exists in DB, return name
            const { data } = await client.query({ query: findUserByEmail, 
              variables: {email: user.email} });
            if(data.findUserByEmail && data.findUserByEmail.name) {
              console.log(data.findUserByEmail)
              return {
                randName: false,
                user: { name: data.findUserByEmail.name, _id: data.findUserByEmail._id }
              }
            }
            else { //make new user
              //look for duplicates
              let nickname;
              let isRandomName = false;
              const { data } = await client.query({ query: findUserByName, 
                variables: {name: user.user_metadata.full_name} });
              if(data.findUserByName && data.findUserByName.name) { //name taken
                nickname = getRandomName(); //todo name list is not infinite so dups still possible
                isRandomName = true;
              }
              else {
                nickname = user.user_metadata.full_name;
              }
              const variables = {
                name: nickname,
                email: user.email
              };
              //Todo turning query into mutation on db is probably bad
              const response = await client.mutate({ mutation: createUser, variables });
              const dbUser = response.data.createUser;
              console.log(dbUser)
              return {
                randName: isRandomName,
                user: { name: dbUser.name, _id: dbUser._id }
              }             
            }
          }
          return null; //not logged in
        },
      }
    },
  });

  const server = new ApolloServer({
    schema: mergedSchema
  })
  return new Promise((yay, nay) => {
    const cb = (err, args) => (err ? nay(err) : yay(args))
    server.createHandler()(event, lambdaContext, cb)
  })
}