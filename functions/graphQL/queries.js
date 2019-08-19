
exports.MESSAGES = `
query getAllMsg {
  messages {
    data {
      _id
      author
      text
    }
  }
}
`;


exports.CREATE_MESSAGE = `
  mutation cMsg( $msgData: MessageInput!) {
    createMessage(data: $msgData) {
      _id
      author
      text
    }
  }
`