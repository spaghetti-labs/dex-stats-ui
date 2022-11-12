import * as React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Avatar, AvatarGroup, Box, Chip, Collapse, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Skeleton } from '@mui/material';
import { ReactComponent as UniswapLogo } from '../../assets/uniswap.svg'
import { Article, ExpandLess, ExpandMore, Info, QueryStats, Refresh, ShowChart, Widgets } from '@mui/icons-material';
import { CryptoIcon } from '../../crypto-icons/crypto-icon';

export const GET_UNISWAP_V2_PAIRS = gql`
  query GetUniswapV2Pairs {
    uniswapV2 {
      pairs {
        address
        token0 {
          name
          symbol
          decimals
        }
        token1 {
          name
          symbol
          decimals
        }
      }
    }
  }
`

interface QueryGetUniswapV2Pairs {
  uniswapV2: {
    pairs: IPair[]
  }
}

export interface IPair {
  address: string
  token0: {
    name: string
    symbol: string
    decimals: number
  }
  token1: {
    name: string
    symbol: string
    decimals: number
  }
}

export function UniswapV2Tool() {
  const {
    data: {
      uniswapV2: {
        pairs
      } = {}
    } = {},
    loading,
    refetch,
  } = useQuery<QueryGetUniswapV2Pairs>(GET_UNISWAP_V2_PAIRS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  const [openPairAddress, setOpenPairAddress] = React.useState<string | null>(null);

  return <Box width='100%' height='100%' display='flex' flexDirection='column' gap={2} justifyContent='center' alignContent='center' overflow='hidden'>
    {!loading && <List>{pairs.map(({ address, token0, token1 }) => <React.Fragment key={address}>
      <ListItemButton onClick={() => {
        if (openPairAddress === address) {
          setOpenPairAddress(null)
        } else {
          setOpenPairAddress(address)
        }
      }}>
        <ListItemIcon>
          <AvatarGroup>
            <Avatar sx={{width: 24, height: 24}}><CryptoIcon name={token0.symbol} size={24} /></Avatar>
            <Avatar sx={{width: 24, height: 24}}><CryptoIcon name={token1.symbol} size={24} /></Avatar>
          </AvatarGroup>
        </ListItemIcon>
        <ListItemText primary={`${token0.symbol} - ${token1.symbol}`} secondary={`${token0.name} - ${token1.name}`} />
        <ListItemSecondaryAction>
          {openPairAddress === address ? <ExpandLess /> : <ExpandMore />}
        </ListItemSecondaryAction>
      </ListItemButton>
      <Collapse in={openPairAddress === address} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4, cursor: 'move' }} draggable onDragStart={e => {
              e.dataTransfer.setData("text/json", JSON.stringify({
                type: 'uniswap/v2/pair',
                payload: {
                  address,
                },
              }))
            }}>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText primary="Basic info" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4, cursor: 'move' }} draggable onDragStart={e => {
              e.dataTransfer.setData("text/json", JSON.stringify({
                type: 'uniswap/v2/pair/stats',
                payload: {
                  address,
                },
              }))
            }}>
            <ListItemIcon>
              <ShowChart />
            </ListItemIcon>
            <ListItemText primary="Statistics" />
          </ListItemButton>
        </List>
      </Collapse>
    </React.Fragment>)}</List>}
  </Box>
}
