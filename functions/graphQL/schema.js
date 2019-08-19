const { gql } = require('graphql-tag')

exports.typeDefs = `
directive @embedded on OBJECT
directive @collection(name: String!) on OBJECT
directive @index(name: String!) on FIELD
directive @resolver(name: String, paginated: Boolean! = false) on FIELD
directive @relation(name: String) on FIELD
directive @unique(index: String) on FIELD
scalar Date

# Long can represent values between -(2^63) and 2^63 - 1.
scalar Long

type Message {
  # The document's ID.
  _id: ID!
  # The document's timestamp.
  _ts: Long!
  author: String!
  text: String!
}

# 'Message' input values
input MessageInput {
  author: String!
  text: String!
}

# The pagination object for elements of type 'Message'.
type MessagePage {
  # The elements of type 'Message' in this page.
  data: [Message]!
  # A cursor for elements coming after the current page.
  after: String
  # A cursor for elements coming before the current page.
  before: String
}

type Mutation {
  # Create a new document in the collection of 'Message'
  createMessage(
    # 'Message' input values
    data: MessageInput!
  ): Message!
  # Update an existing document in the collection of 'Message'
  updateMessage(
    # The 'Message' document's ID
    id: ID!
    # 'Message' input values
    data: MessageInput!
  ): Message
  # Delete an existing document in the collection of 'Message'
  deleteMessage(
    # The 'Message' document's ID
    id: ID!
  ): Message
}

type Query {
  # Find a document from the collection of 'Message' by its id.
  findMessageByID(
    # The 'Message' document's ID
    id: ID!
  ): Message
  messages(
    # The number of items to return per page.
    _size: Int
    # The pagination cursor.
    _cursor: String
  ): MessagePage!
}

scalar Time


`

