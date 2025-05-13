// src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing auth token

// Your GraphQL API endpoint
const GRAPHQL_ENDPOINT = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
// IMPORTANT: For Android emulators, localhost is 10.0.2.2 if backend is on the same machine.
// For physical devices, use your machine's local network IP.
// Using EXPO_PUBLIC_ prefix makes it available in client-side JS. Set this in your .env file.
// Example .env:
// EXPO_PUBLIC_GRAPHQL_ENDPOINT=http://192.168.1.100:4000/graphql

if (!GRAPHQL_ENDPOINT || GRAPHQL_ENDPOINT === 'http://localhost:4000/graphql') {
  console.warn(
    'Apollo Client: GRAPHQL_ENDPOINT is not set or using default localhost. ' +
    'This might not work on physical devices or Android emulators. ' +
    'Set EXPO_PUBLIC_GRAPHQL_ENDPOINT in your .env file.'
  );
}


const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Middleware to add the JWT token to requests
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from async storage if it exists
  const token = await AsyncStorage.getItem('authToken'); // Use a consistent key

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), // Chain the auth link before the HTTP link
  cache: new InMemoryCache(),
  // Optional: Default options for queries/mutations
  // defaultOptions: {
  //   watchQuery: {
  //     fetchPolicy: 'cache-and-network',
  //   },
  //   query: {
  //     fetchPolicy: 'network-only',
  //     errorPolicy: 'all',
  //   },
  //   mutate: {
  //     errorPolicy: 'all',
  //   },
  // },
});

export default client;