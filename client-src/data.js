import ApolloClient from 'apollo-boost';
import { writable } from 'svelte/store';

export const client = new ApolloClient({
  uri: '/.netlify/functions/graphQL'
});

export const myName = writable('me');