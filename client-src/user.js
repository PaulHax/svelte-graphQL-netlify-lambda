import { readable } from 'svelte/store';
import { gql } from 'apollo-boost';
import { client } from './data';
import { mutate } from 'svelte-apollo';
import { getRandomName }  from'./name-factory';

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
      setIsSignedIn(true);
      localStorage.setItem('usertoken', JSON.stringify(signUp.token));      
    }
  })
}

export function signOut() {
  localStorage.removeItem('usertoken')
  setIsSignedIn(false);
  setName(getRandomName());
}

let setIsSignedIn; //todo resolve setup order potental bug with myName 
export const isSignedIn = readable(false, function start(set) {
    setIsSignedIn = set;
  }
);

let setName;
export const myName = readable(null, function start(set) {
    setName = (newName) => { //hide setname just for this module
      set(newName);
    }
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
  //const userToken = 'asdfasdf'
  const { data } = await client.query({ query: GET_MY_USER, variables: { userToken } });
  
  if(data.GetMyUser) {
    setName( data.GetMyUser.username );
    setIsSignedIn(true);
  }
  else { //anonymous
    setName(getRandomName());
  }
  
}