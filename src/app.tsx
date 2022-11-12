import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {
  ApolloProvider,
} from "@apollo/client";
import { client } from './client';
import { DashboardPage } from './pages/dashboard.page';

export function App() {
  return <>
    <CssBaseline enableColorScheme />
    <ApolloProvider client={client}>
      <DashboardPage />
    </ApolloProvider>
  </>;
}
