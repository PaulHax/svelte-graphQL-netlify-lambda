import { readable, get } from 'svelte/store';
import { client } from './data';
import { mutate } from 'svelte-apollo';
import { gql } from 'apollo-boost';
import { getRandomName }  from'./name-factory';
import netlifyIdentity from 'netlify-identity-widget';

const updateUser = gql`
mutation UpdateUser ($id: ID!, $name: String!, $email: String!) {
  updateUser( id: $id, data: { name: $name, email: $email } )
  {
    name
  }
    
}`

export async function setMyName(name) {  
  if( get(isSignedIn) ) {
    let userID = localStorage.getItem('userid');
    const user = netlifyIdentity.currentUser();
    const response = await mutate(client, {
      mutation: updateUser,
      variables: { id: userID, name: name, email: user.email }
    });
    setName(response.data.updateUser.name);
  }
  else {
    setName(name);
  }
}

export function signOut() {
  localStorage.removeItem('nickname');
  localStorage.removeItem('userid')
  setIsSignedIn(false);
  setName(getRandomName());
  client.resetStore(); //client.resetStore() to refetch queries. client.clearStore() causes bug on next queries/mutation?
}

let setIsSignedIn; //todo resolve setup order potental bug with myName 
let isIn = false;
netlifyIdentity.init();
if(netlifyIdentity.currentUser() != null) {
  isIn = true;
}
export const isSignedIn = readable(isIn, function start(set) {
    setIsSignedIn = set;
  }
);

let setName;
let startName = '';
if (isIn) {
  startName = localStorage.getItem('nickname');
}
export const myName = readable(startName, function start(set) {
    setName = (newName) => { //hide setname just for this module
      set(newName);
      localStorage.setItem('nickname', newName);
    }
  }
);

const GET_MY_USER = gql`
  query getMyUser  {
    GetMyUser {
      randName
      user {
        _id
        name
      }
    }
  }
`;

export async function authenticate() {
  const user = netlifyIdentity.currentUser();
  if(user) {
    const { data } = await client.query({ query: GET_MY_USER });  //also creates user if not existing
    setIsSignedIn(true); 
    if(data.GetMyUser) {
      localStorage.setItem('userid', data.GetMyUser.user._id);
      setName( data.GetMyUser.user.name );
    }
    if(data.GetMyUser.randName) {
      return user.user_metadata.full_name; //name was duplicate
    }
    return false;
  }
  //anonymous
  setName(getRandomName());
  return null;
}