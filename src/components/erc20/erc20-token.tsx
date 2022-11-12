import * as React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Avatar, Box, Button, Card, CardActionArea, CardActions, CardContent, CardHeader, Chip, CircularProgress, Divider, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemText, Paper, Skeleton, Typography } from '@mui/material';
import { CryptoIcon } from '../../crypto-icons/crypto-icon';
import BigNumber from 'bignumber.js';
import { ReactComponent as SolidityLogo } from '../../assets/solidity.svg'
import { Article, Refresh } from '@mui/icons-material';
import { WidgetContainer } from '../widget/widget-container';

export const GET_ERC20_TOKEN = gql`
  query GetErc20Token($address: EthereumAddress!) {
    erc20 {
      token(identifier: { address: $address }) {
        address
        name
        symbol
        decimals
      }
    }
  }
`

interface QueryErc20Token {
  erc20: {
    token: IToken
  }
}

export interface IToken {
  address: string
  name: string
  symbol: string
  decimals: number
}

export function Erc20Token({
  payload: {
    address,
  },
  onRemove,
}: {
  payload: {
    address?: string,
  },
  onRemove: () => void,
}) {
  if (address == null) {
    return <>Specify address</>
  }

  const {
    data: {
      erc20: {
        token
      } = {}
    } = {},
    loading,
    refetch,
  } = useQuery<QueryErc20Token>(GET_ERC20_TOKEN, {
    variables: {
      address,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  return <WidgetContainer graphql={GET_ERC20_TOKEN} onRefresh={() => refetch()} onRemove={onRemove} breadcrumbs={[
      <>
        <SolidityLogo height={20} />
        ERC-20
      </>,
      <>
        {loading && <Skeleton animation='pulse' variant="text" width={96} height={20} />}
        {!loading && <>
          <CryptoIcon name={token.symbol} size={20} />
          {token.symbol}
        </>}
      </>
    ]}>
    {!loading && <List dense>
      <ListItem>
        <ListItemText primary={token.symbol} secondary="Symbol" />
      </ListItem>
      <ListItem>
        <ListItemText primary={token.name} secondary="Name" />
      </ListItem>
      <ListItem>
        <ListItemText primary={token.decimals.toFixed()} secondary="Decimals" />
      </ListItem>
    </List>}
  </WidgetContainer>
}
