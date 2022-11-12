import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP Link
const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql",
});

// Adds Authentication Headers on HTTP as well as was requests
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "X-Auth-Key": "test",
      "X-Auth-Role": "admin",
    },
  };
});

// WebSocket Link
const wsLink = new WebSocketLink({
  uri: `ws://localhost:8080/graphql`,
  options: {
    reconnect: true,
    lazy: true,
  },
});

// Send query request based on the type definition
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  authLink.concat(wsLink),
  authLink.concat(httpLink)
);

// Apollo Client
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});