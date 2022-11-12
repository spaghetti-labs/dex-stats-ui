import * as React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Avatar, AvatarGroup, Box, Chip, Collapse, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Skeleton } from '@mui/material';
import { ReactComponent as EthereumLogo } from '../../assets/ethereum.svg'
import { Article, ExpandLess, ExpandMore, Info, QueryStats, Refresh, ShowChart, Widgets } from '@mui/icons-material';
import { CryptoIcon } from '../../crypto-icons/crypto-icon';

export const GET_ERC20_TOKENS = gql`
  query GetErc20Tokens {
    erc20 {
      tokens {
        address
        decimals
        name
        symbol
      }
    }
  }
`

interface QueryGetErc20Tokens {
  erc20: {
    tokens: IToken[]
  }
}

export interface IToken {
  address: string
  name: string
  symbol: string
  decimals: number
}

export function Erc20Tool() {
  const {
    data: {
      erc20: {
        tokens
      } = {}
    } = {},
    loading,
    refetch,
  } = useQuery<QueryGetErc20Tokens>(GET_ERC20_TOKENS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  return <Box width='100%' height='100%' display='flex' flexDirection='column' gap={2} justifyContent='center' alignContent='center' overflow='hidden'>
    {tokens != null && <List>{tokens.map(({ address, decimals, name, symbol }) => <React.Fragment key={address}>
      <ListItem style={{cursor: 'move'}} draggable onDragStart={e => {
          e.dataTransfer.setData("text/json", JSON.stringify({
            type: 'erc20/token',
            payload: {
              address,
            },
          }))
        }}>
        <ListItemIcon>
          <CryptoIcon name={symbol} size={40} />
        </ListItemIcon>
        <ListItemText primary={symbol} secondary={name} />
      </ListItem>
    </React.Fragment>)}</List>}
  </Box>
}
