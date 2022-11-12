import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { useMemo } from "react";
import { useApiSettings } from "./components/api/api-settings";

const cache = new InMemoryCache()

// HTTP Link
const httpLink = new HttpLink({
  uri: "http://localhost:8080/graphql",
});

// WebSocket Link
const wsLink = new WebSocketLink({
  uri: `ws://localhost:8080/graphql`,
  options: {
    reconnect: true,
    lazy: true,
  },
});

function buildLink(wsLink: ApolloLink, httpLink: ApolloLink): ApolloLink {
  return split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  )
}

const defaultLink = buildLink(wsLink, httpLink);

export function useLink(): ApolloLink {
  const { apiKey } = useApiSettings() ?? {}

  return useMemo(() => {
    if (apiKey == null) {
      return defaultLink
    }

    // Adds Authentication Headers on HTTP as well as was requests
    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          "X-Auth-Key": apiKey,
          "X-Auth-Role": "admin",
        },
      };
    });

    // Send query request based on the type definition
    return buildLink(
      authLink.concat(wsLink),
      authLink.concat(httpLink),
    );
  }, [apiKey, wsLink, httpLink])
}

export function useClient(): ApolloClient<any> {
  const link = useLink()

  return useMemo(() => {
    // Apollo Client
    return new ApolloClient({
      link,
      cache,
    });
  }, [link, cache])
}
