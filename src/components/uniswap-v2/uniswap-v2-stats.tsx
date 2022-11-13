import * as React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Avatar, AvatarGroup, Button, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Skeleton, Slider, SliderValueLabelProps, Switch, Table, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { CryptoIcon } from '../../crypto-icons/crypto-icon';
import BigNumber from 'bignumber.js';
import { ReactComponent as UniswapLogo } from '../../assets/uniswap.svg'
import { sub, getUnixTime, fromUnixTime, format } from 'date-fns';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip, Bar, ComposedChart, Area } from 'recharts';
import { WidgetContainer } from '../widget/widget-container';
import { formatNumber } from '../../utils/number-format';
import { SwapHoriz } from '@mui/icons-material';
import zIndex from '@mui/material/styles/zIndex';

export const GET_UNISWAP_V2_PAIR_STATS = gql`
  query GetUniswapV2PairStats($address: EthereumAddress!, $fromTimestamp: UnixTime!, $slices: UInt!) {
    uniswapV2 {
      pair(identifier: { address: $address }) {
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
        stats(from: {timestamp: $fromTimestamp}, to: {tag: LAST}, splits: $slices) {
          from {
            blockNumber
            timestamp
            sync {
              token0Reserve
              token1Reserve
            }
          }
          to {
            blockNumber
            timestamp
            sync {
              token0Reserve
              token1Reserve
            }
          }
          token0Volume
          token1Volume
        }
      }
    }
  }
`

interface QueryGetUniswapV2PairStats {
  uniswapV2: {
    pair: IPair
  }
}

export interface IPair {
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
  stats: {
    from: {
      blockNumber: number
      timestamp: number
      sync: {
        token0Reserve: string
        token1Reserve: string
      }
    }
    to: {
      blockNumber: number
      timestamp: number
      sync: {
        token0Reserve: string
        token1Reserve: string
      }
    }
    token0Volume: string
    token1Volume: string
  }[]
}

function PairContent({
  pair,
  payload: {
    charts: {
      token0: {
        reserve: token0Reserve = false,
        volume: token0Volume = false,
        delta: token0Delta = false,
      } = {},
      token1: {
        reserve: token1Reserve = false,
        volume: token1Volume = false,
        delta: token1Delta = false,
      } = {},
      value,
    } = {}
  },
}: {
  pair: IPair,
  payload: UniswapV2PairStatsPayload,
}) {
  const { token0, token1, stats = [] } = pair

  const data = React.useMemo(
    () => stats.map(({
      from,
      to,
      token0Volume,
      token1Volume,
    }) => {
      const fromToken0ReserveBn = new BigNumber(from.sync.token0Reserve).shiftedBy(-token0.decimals)
      const fromToken1ReserveBn = new BigNumber(from.sync.token1Reserve).shiftedBy(-token1.decimals)
      const toToken0ReserveBn = new BigNumber(to.sync.token0Reserve).shiftedBy(-token0.decimals)
      const toToken1ReserveBn = new BigNumber(to.sync.token1Reserve).shiftedBy(-token1.decimals)
      const toToken0Value = toToken1ReserveBn.dividedBy(toToken0ReserveBn)
      const toToken1Value = toToken0ReserveBn.dividedBy(toToken1ReserveBn)
      const token0VolumeBn = new BigNumber(token0Volume).shiftedBy(-token0.decimals)
      const token1VolumeBn = new BigNumber(token1Volume).shiftedBy(-token1.decimals)
      const token0DeltaBn = toToken0ReserveBn.minus(fromToken0ReserveBn)
      const token1DeltaBn = toToken1ReserveBn.minus(fromToken1ReserveBn)
      return {
        timestamp: fromUnixTime(to.timestamp),
        token0Value: toToken0Value.toNumber(),
        token1Value: toToken1Value.toNumber(),
        token0Volume: token0VolumeBn.toNumber(),
        token1Volume: token1VolumeBn.toNumber(),
        token0Reserve: toToken0ReserveBn.toNumber(),
        token1Reserve: toToken1ReserveBn.toNumber(),
        token0Delta: token0DeltaBn.toNumber(),
        token1Delta: token1DeltaBn.toNumber(),
      }
    }),
    [stats, token0.decimals, token1.decimals]
  )

  let nextOrientation = false;

  return <>
    <ResponsiveContainer>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.85}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.15}/>
          </linearGradient>
          <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.85}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.15}/>
          </linearGradient>
        </defs>

        <CartesianGrid />

        <XAxis dataKey="timestamp" tickFormatter={timestamp => format(timestamp, 'd MMM yy')} />

        {token0Volume && <>
          <YAxis yAxisId='token0Volume' dataKey="token0Volume" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Area type='monotone' dataKey="token0Volume" yAxisId="token0Volume" name={`${token0.symbol} Volume`} stroke='#8884d8' fill="url(#colorA)" strokeWidth={2} opacity={0.85} />
        </>}

        {token1Volume && <>
          <YAxis yAxisId='token1Volume' dataKey="token1Volume" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Area type='monotone' dataKey="token1Volume" yAxisId="token1Volume" name={`${token1.symbol} Volume`} stroke='#82ca9d' fill="url(#colorB)" strokeWidth={2} opacity={0.85} />
        </>}

        {token0Reserve && <>
          <YAxis yAxisId='token0Reserve' dataKey="token0Reserve" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Line type="monotone" dataKey="token0Reserve" yAxisId="token0Reserve" dot={false} name={`${token0.symbol} Reserve`} stroke='#8884d8' strokeWidth={2} opacity={0.85} />
        </>}

        {token1Reserve && <>
          <YAxis yAxisId='token1Reserve' dataKey="token1Reserve" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Line type="monotone" dataKey="token1Reserve" yAxisId="token1Reserve" dot={false} name={`${token1.symbol} Reserve`} stroke='#82ca9d' strokeWidth={2} opacity={0.85} />
        </>}

        {value === 'token0' && <>
          <YAxis yAxisId='token0Value' dataKey="token0Value" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Line type="monotone" dataKey="token0Value" yAxisId="token0Value" dot={false} name={`${token0.symbol} Value`} stroke='#8884d8' strokeWidth={2} opacity={0.85} />
        </>}

        {value === 'token1' && <>
          <YAxis yAxisId='token1Value' dataKey="token1Value" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Line type="monotone" dataKey="token1Value" yAxisId="token1Value" dot={false} name={`${token1.symbol} Value`} stroke='#82ca9d' strokeWidth={2} opacity={0.85} />
        </>}

        {token0Delta && <>
          <YAxis yAxisId='token0Delta' dataKey="token0Delta" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Area type='monotone' dataKey="token0Delta" yAxisId="token0Delta" name={`${token0.symbol} Delta`} stroke='#8884d8' fill="url(#colorA)" strokeWidth={2} opacity={0.85} />
        </>}

        {token1Delta && <>
          <YAxis yAxisId='token1Delta' dataKey="token1Delta" domain={['auto', 'auto']} tickFormatter={formatNumber} orientation={(nextOrientation=!nextOrientation) ? 'left' : 'right'} />
          <Area type='monotone' dataKey="token1Delta" yAxisId="token1Delta" name={`${token1.symbol} Delta`} stroke='#82ca9d' fill="url(#colorA)" strokeWidth={2} opacity={0.85} />
        </>}
        
        <Tooltip formatter={(v, name) => {
          switch (name) {
            case `${token0.symbol} Volume`:
              return `${token0.symbol} ${formatNumber(v as any)}`;
            case `${token1.symbol} Volume`:
              return `${token1.symbol} ${formatNumber(v as any)}`;
            case `${token0.symbol} Reserve`:
              return `${token0.symbol} ${formatNumber(v as any)}`;
            case `${token1.symbol} Reserve`:
              return `${token1.symbol} ${formatNumber(v as any)}`;
            case `${token0.symbol} Delta`:
              return `${token0.symbol} ${formatNumber(v as any)}`;
            case `${token1.symbol} Delta`:
              return `${token1.symbol} ${formatNumber(v as any)}`;
            case `${token0.symbol} Value`:
                return `${token1.symbol} ${formatNumber(v as any)}`;
            case `${token1.symbol} Value`:
              return `${token0.symbol} ${formatNumber(v as any)}`;
          }
        }} />
        <Legend />
        
      </ComposedChart>
    </ResponsiveContainer>
  </>
}

export interface UniswapV2PairStatsPayload {
  address: string
  charts?: {
    token0?: {
      volume?: boolean
      reserve?: boolean
      delta?: boolean
    },
    token1?: {
      volume?: boolean
      reserve?: boolean
      delta?: boolean
    },
    value?: 'token0' | 'token1',
  },
  slices?: number
}

function Settings({
  pair,
  payload,
  onPayloadChange,
}: {
  pair?: IPair,
  payload: UniswapV2PairStatsPayload,
  onPayloadChange: (payload: UniswapV2PairStatsPayload) => void,
}) {
  const { token0, token1 } = pair ?? {}
  const { slices = 64 } = payload

  function setChartsValue(value: 'token0' | 'token1' | null) {
    onPayloadChange({
      ...payload,
      charts: {
        ...payload.charts,
        value,
      },
    })
  }

  function setChartsTokenVolume(token: 'token0' | 'token1', volume: boolean) {
    onPayloadChange({
      ...payload,
      charts: {
        ...payload.charts,
        [token]: {
          ...payload.charts?.[token],
          volume,
        },
      },
    })
  }

  function setChartsTokenReserve(token: 'token0' | 'token1', reserve: boolean) {
    onPayloadChange({
      ...payload,
      charts: {
        ...payload.charts,
        [token]: {
          ...payload.charts?.[token],
          reserve,
        },
      },
    })
  }

  function setChartsTokenDelta(token: 'token0' | 'token1', delta: boolean) {
    onPayloadChange({
      ...payload,
      charts: {
        ...payload.charts,
        [token]: {
          ...payload.charts?.[token],
          delta,
        },
      },
    })
  }

  function setSlices(slices: number) {
    onPayloadChange({
      ...payload,
      slices,
    })
  }

  return <>
    <TableContainer style={{width: '400px'}}>
      <Table sx={{
          [`& .${tableCellClasses.root}`]: {
            borderBottom: "none"
          }
        }}
        size='small'>
        <TableRow>
          <TableCell>
            Slices:&nbsp;
            <Typography variant='button'>
              {slices.toFixed()}
            </Typography>
          </TableCell>
          <TableCell colSpan={2} align='center'>
            <Slider
              style={{width: '128px'}}
              value={slices}
              onChange={(_, value) => setSlices(value as number)}
              min={4}
              max={128}
              step={1} />
          </TableCell>
        </TableRow>
        <TableCell colSpan={3}>
        <Divider />
        </TableCell>
        <TableRow>
          <TableCell />
          <TableCell align='center'>
            <CryptoIcon name={token0?.symbol} size={32} />
          </TableCell>
          <TableCell align='center'>
            <CryptoIcon name={token1?.symbol} size={32} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell />
          <TableCell align='center' width='128px'>
            <Typography textOverflow='ellipsis' variant='inherit'>{token0?.name ?? 'Token #0'}</Typography>
          </TableCell>
          <TableCell align='center' width='128px'>
            <Typography textOverflow='ellipsis' variant='inherit'>{token1?.name ?? 'Token #1'}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            Value
          </TableCell>
          <TableCell align='center'>
            <Switch
              checked={payload.charts?.value === 'token0'}
              onChange={(_, value) => setChartsValue(value ? 'token0' : null)} />
          </TableCell>
          <TableCell align='center'>
          <Switch
              checked={payload.charts?.value === 'token1'}
              onChange={(_, value) => setChartsValue(value ? 'token1' : null)} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            Volume
          </TableCell>
          <TableCell align='center'>
            <Switch
              checked={payload.charts?.token0?.volume ?? false}
              onChange={(_, value) => setChartsTokenVolume('token0', value)} />
          </TableCell>
          <TableCell align='center'>
            <Switch
              checked={payload.charts?.token1?.volume ?? false}
              onChange={(_, value) => setChartsTokenVolume('token1', value)} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            Reserve
          </TableCell>
          <TableCell align='center'>
            <Switch
              checked={payload.charts?.token0?.reserve ?? false}
              onChange={(_, value) => setChartsTokenReserve('token0', value)} />
          </TableCell>
          <TableCell align='center'>
            <Switch
              checked={payload.charts?.token1?.reserve ?? false}
              onChange={(_, value) => setChartsTokenReserve('token1', value)} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            Reserve Delta
          </TableCell>
          <TableCell align='center'>
            <Switch
              checked={payload.charts?.token0?.delta ?? false}
              onChange={(_, value) => setChartsTokenDelta('token0', value)} />
          </TableCell>
          <TableCell align='center'>
            <Switch
              checked={payload.charts?.token1?.delta ?? false}
              onChange={(_, value) => setChartsTokenDelta('token1', value)} />
          </TableCell>
        </TableRow>
      </Table>
    </TableContainer>
  </>
}

export function UniswapV2PairStats({
  payload,
  onRemove,
  onPayloadChange,
}: {
  payload: UniswapV2PairStatsPayload,
  onRemove: () => void,
  onPayloadChange: (payload: UniswapV2PairStatsPayload) => void,
}) {
  const fromDate = React.useMemo(() => sub(new Date(), { years: 1 }), [])
  const fromTimestamp = React.useMemo(() => getUnixTime(fromDate), [fromDate]);

  const { address, slices = 64 } = payload

  const {
    data: {
      uniswapV2: {
        pair
      } = {}
    } = {},
    loading,
    refetch,
  } = useQuery<QueryGetUniswapV2PairStats>(GET_UNISWAP_V2_PAIR_STATS, {
    variables: {
      address,
      fromTimestamp,
      slices,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  return <WidgetContainer disableOverflow
    settings={<Settings pair={pair} payload={payload} onPayloadChange={onPayloadChange} />}
    graphql={GET_UNISWAP_V2_PAIR_STATS}
    onRefresh={() => refetch()}
    onRemove={onRemove}
    breadcrumbs={[
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
    {pair == null && <Skeleton style={{flex: 1}} animation='pulse' variant="rounded" />}
    {pair != null && <PairContent pair={pair} payload={payload} />}
  </WidgetContainer>
}
