import ApolloClient from 'apollo-boost';
import { gql } from 'apollo-boost';
import netlifyIdentity from 'netlify-identity-widget';

export const client = new ApolloClient({
  uri: '/.netlify/functions/graphQLEndpoint',
  request: (operation) => {
    const user = netlifyIdentity.currentUser();
    const token = user && user.token.access_token;
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    })
  }
});


export const MESSAGES = gql`
  query allMessages($size: Int, $cursor: String)  {
    messages(_size: $size, _cursor: $cursor) {
      data {
        _id
        author
        text
      }
      before
      after
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