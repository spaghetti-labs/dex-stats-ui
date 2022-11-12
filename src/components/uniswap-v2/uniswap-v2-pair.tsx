import * as React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Avatar, AvatarGroup, Box, Button, Card, CardActionArea, CardActions, CardContent, CardHeader, Chip, CircularProgress, Divider, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemText, Paper, Skeleton, Typography } from '@mui/material';
import { CryptoIcon } from '../../crypto-icons/crypto-icon';
import BigNumber from 'bignumber.js';
import { ReactComponent as UniswapLogo } from '../../assets/uniswap.svg'
import { Article, Refresh } from '@mui/icons-material';
import { WidgetContainer } from '../widget/widget-container';
import { formatNumber } from '../../utils/number-format';

export const GET_UNISWAP_V2_PAIR = gql`
  query GetUniswapV2Pair($address: EthereumAddress!) {
    uniswapV2 {
      pair(identifier: { address: $address }) {
        address
        token0 {
          address
          name
          symbol
          decimals
        }
        token1 {
          address
          name
          symbol
          decimals
        }
        startBlock
        eventsHeight
        statsHeight
        block(identifier: {tag: LAST}) {
          blockNumber
          timestamp
          sync {
            token0Reserve
            token1Reserve
          }
        }
      }
    }
  }
`

interface QueryGetUniswapV2Pair {
  uniswapV2: {
    pair: IPair
  }
}

export interface IPair {
  address: string
  token0: {
    address: string
    name: string
    symbol: string
    decimals: number
  }
  token1: {
    address: string
    name: string
    symbol: string
    decimals: number
  }
  startBlock: number
  eventsHeight: number
  statsHeight: number
  block: {
    blockNumber: number
    timestamp: number
    sync: {
      token0Reserve: string
      token1Reserve: string
    }
  }
}

function PairTokenContent({
  symbol,
  name,
  reserve,
  value,
  pairSymbol,
}: {
  symbol: string,
  name: string,
  reserve: BigNumber,
  value: BigNumber,
  pairSymbol: string,
}) {
  return <List dense style={{width: '256px'}}>
    <ListItem>
      <ListItemAvatar>
        <CryptoIcon name={symbol} size={40} />
      </ListItemAvatar>
      <ListItemText primary={symbol} secondary={name} />
    </ListItem>
    <ListItem>
      <ListItemAvatar />
      <ListItemText primary={`${symbol} ${formatNumber(reserve)}`} secondary="Reserve" />
    </ListItem>
    <ListItem>
      <ListItemAvatar />
      <ListItemText primary={`${pairSymbol} ${formatNumber(value)}`} secondary="Value" />
    </ListItem>
  </List>
}

function PairContent({
  pair,
}: {
  pair: IPair,
}) {
  const { token0, token1, block: {
    blockNumber,
    timestamp,
    sync: {
      token0Reserve,
      token1Reserve,
    },
  } } = pair

  const token0ReserveBn = new BigNumber(token0Reserve).shiftedBy(-token0.decimals)
  const token1ReserveBn = new BigNumber(token1Reserve).shiftedBy(-token1.decimals)

  const token0Value = token1ReserveBn.dividedBy(token0ReserveBn)
  const token1Value = token0ReserveBn.dividedBy(token1ReserveBn)

  return <>
    <PairTokenContent name={token0.name} symbol={token0.symbol} reserve={token0ReserveBn} value={token0Value} pairSymbol={token1.symbol} />
    <PairTokenContent name={token1.name} symbol={token1.symbol} reserve={token1ReserveBn} value={token1Value} pairSymbol={token0.symbol} />
  </>
}

export function UniswapV2Pair({
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
      uniswapV2: {
        pair
      } = {}
    } = {},
    loading,
    refetch,
  } = useQuery<QueryGetUniswapV2Pair>(GET_UNISWAP_V2_PAIR, {
    variables: {
      address,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  return <WidgetContainer graphql={GET_UNISWAP_V2_PAIR} onRefresh={() => refetch()} onRemove={onRemove} breadcrumbs={[
    <>
      <UniswapLogo height={20} />
      Uniswap V2
    </>,
    <>
      {pair == null && <Skeleton animation='pulse' variant="text" width={96} height={20} />}
      {pair != null && <>
        <AvatarGroup>
          <Avatar sx={{ width: 20, height: 20 }}>
            <CryptoIcon name={pair.token0.symbol} size={20} />
          </Avatar>
          <Avatar sx={{ width: 20, height: 20 }}>
            <CryptoIcon name={pair.token1.symbol} size={20} />
          </Avatar>
        </AvatarGroup>
        {pair.token0.symbol} - {pair.token1.symbol}
      </>}
    </>
  ]}>
    <Box display='flex' flexDirection='row' flexWrap='wrap' alignItems='center' justifyContent='center' alignContent='center' gap={2}>
      {pair == null && <>
        <Skeleton animation='pulse' variant="rounded" width={256} height={197} />
        <Skeleton animation='pulse' variant="rounded" width={256} height={197} />
      </>}
      {pair != null && <PairContent pair={pair} />}
    </Box>
  </WidgetContainer>
}
