import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {
  ApolloProvider,
} from "@apollo/client";
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { APISettingsRoot } from './components/api/api-settings';
import { useClient } from './client';

function WithAPISettings() {
  const client = useClient()
  return <ApolloProvider client={client}>
    <DashboardPage />
  </ApolloProvider>
}

export function App() {
  return <>
    <CssBaseline enableColorScheme />
    <APISettingsRoot>
      <WithAPISettings />
    </APISettingsRoot>
  </>;
}
