import ApolloClient from 'apollo-boost';
import { writable } from 'svelte/store';
import { gql } from 'apollo-boost';

export const client = new ApolloClient({
  uri: '/.netlify/functions/graphQL'
});

export const myName = writable('New Head');

export const MESSAGES = gql`
  query allMessages {
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
