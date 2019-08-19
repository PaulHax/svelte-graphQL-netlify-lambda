import { gql } from 'apollo-boost';

export const MESSAGES = gql`
  query asdf {
    messages {
      data {
        _id
        author
        text
      }
    }
  }
`;


export const CREATE_MESSAGE = gql`
  mutation AddMessage($author: String!, $text: String!) {
    createMessage(data: {author: $author, text: $text}) {
      _id
      author
      text
    }
  }
`;
