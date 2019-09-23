import { readable } from 'svelte/store';
import { gql } from 'apollo-boost';
import { client } from './data';
import { mutate } from 'svelte-apollo';

export const SIGN_UP = gql`
  mutation SignUp($username: String!) {
    signUp(data: {username: $username, password: null}) {
      token
      user {
        username
      }
    }
  }
`;

export function setMyName(name) {
  return mutate(client, {
    mutation: SIGN_UP,
    variables: { username: name },
    update:  (_, { data: { signUp } }) => {
      setName(signUp.user.username);
      localStorage.setItem('usertoken', JSON.stringify(signUp.token));      
    }
  })
}

let setName;

export const myName = readable(null, function start(set) {
    setName = set; //hide setname just for this module
  }
);

const GET_MY_USER = gql`
  query getMyUser($userToken: String)  {
    GetMyUser(userToken: $userToken) {
      username
    }
  }
`;

export async function authenticate() {
  const userToken = JSON.parse(localStorage.getItem('usertoken'));
  const { data } = await client.query({ query: GET_MY_USER, variables: { userToken } });
  setName( data.GetMyUser.username );
}