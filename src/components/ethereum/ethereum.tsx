import * as React from 'react';
import { gql, useSubscription } from '@apollo/client';
import { Skeleton, Typography } from '@mui/material';
import { WidgetContainer } from '../widget/widget-container';
import { ReactComponent as EthereumLogo } from '../../assets/ethereum.svg'

export const SUBS_ETHEREUM_BLOCK_NUMBER = gql`
  subscription SubscribeEthereumLastBlockNumber {
    ethereumLastBlockNumber
  }
`

interface SubscribeEthereumLastBlockNumber {
  ethereumLastBlockNumber: number
}

export function Ethereum({
  onRemove,
}: {
  onRemove?: () => void,
}) {
  const {data: { ethereumLastBlockNumber } = {}, loading} = useSubscription<SubscribeEthereumLastBlockNumber>(SUBS_ETHEREUM_BLOCK_NUMBER)
  return <WidgetContainer graphql={SUBS_ETHEREUM_BLOCK_NUMBER} onRemove={onRemove} breadcrumbs={[
      <>
        <EthereumLogo height={20} />
        Ethereum
      </>
    ]}>
    {loading && <Skeleton variant='text' height={32} width={128} />}
    {!loading && <Typography variant='h5'>{ethereumLastBlockNumber.toFixed()}</Typography>}
    <Typography variant='subtitle1'>Last Block</Typography>
  </WidgetContainer>
}
