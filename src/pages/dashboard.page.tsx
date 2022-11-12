import * as React from "react";
import { Ethereum } from "../components/ethereum/ethereum";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Card, Container, Divider, Drawer, IconButton, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, styled, Typography } from "@mui/material";
import { UniswapV2Pair } from "../components/uniswap-v2/uniswap-v2-pair";
import { UniswapV2PairStats } from "../components/uniswap-v2/uniswap-v2-stats";
import * as _ from "lodash";
import { ReactComponent as UniswapLogo } from '../assets/uniswap.svg'
import { ReactComponent as EthereumLogo } from '../assets/ethereum.svg'
import { ReactComponent as SolidityLogo } from '../assets/solidity.svg'
import { Add, Api, ExpandMore } from "@mui/icons-material";
import { useMemo } from "react";
import { useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import { UniswapV2Tool } from "../components/uniswap-v2/uniswap-v2-tool";
import { EthereumTool } from "../components/ethereum/ethereum-tool";
import { Erc20Tool } from "../components/erc20/erc20-tool";
import { Erc20Token } from "../components/erc20/erc20-token";
import { WidgetBox } from "../components/widget/widget-box";
import { APISettings } from "../components/api/api-settings";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface WidgetData {
  layout: Layout
  type: string
  payload: Record<string, any>
}

class DashboardManager {
  private widgets: WidgetData[]
  private localStorageKey = 'dex-stats-api/ui/dashboard/widgets'
  private listeners: Array<() => void> = []
  constructor() {
    this.load();
    window.addEventListener('storage', e => {
      if (e.key === this.localStorageKey) {
        this.load();
      }
    })
  }

  load() {
    const json = localStorage.getItem(this.localStorageKey)
    if (json == null) {
      this.widgets = []
    } else {
      this.widgets = JSON.parse(json)
    }
    this.notify()
  }

  getWidgets(): WidgetData[] {
    return _.cloneDeep(this.widgets)
  }

  getLayouts(): Layout[] {
    return this.widgets.map(widget => ({...widget.layout}))
  }

  notify() {
    for (const listener of this.listeners.slice()) {
      listener()
    }
  }

  store() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.widgets))
  }

  remove(id: string) {
    this.widgets = this.widgets.filter(widget => widget.layout.i !== id)
    this.store()
    this.notify()
  }

  add({ type, payload, layout }: WidgetData) {
    this.widgets.push({
      type,
      payload: _.cloneDeep(payload),
      layout: {
        ...layout,
        i: uuidV4(),
      },
    })
    this.store()
    this.notify()
  }

  updateLayout(layouts: Layout[]) {
    const map: Record<string, WidgetData> = Object.fromEntries(
      this.widgets.map(widget => [widget.layout.i, widget])
    )
    this.widgets = layouts.filter(layout => layout.i in map).map(layout => ({
      ...map[layout.i],
      layout,
    }))
    this.store()
    this.notify()
  }

  update(id: string, payload: Record<string, any>) {
    const widget = this.widgets.find(widget => widget.layout.i === id)
    if (widget == null) {
      throw new Error('widget not found')
    }
    widget.payload = _.cloneDeep(payload)
    this.store()
    this.notify()
  }

  addEventListener(listener: () => void) {
    this.listeners.push(listener)
  }

  removeEventListener(listener: () => void) {
    const index = this.listeners.indexOf(listener)
    if (index > 0) {
      this.listeners.splice(index, 1)
    }
  }
}

const widgetTypes: {
  type: string
  name: string
  logo: React.ComponentType,
  component: React.ComponentType<{
    onRemove: () => void,
    onPayloadChange?: (payload: any) => void,
    payload: Record<string, any>,
  }>,
}[] = [
  {
    type: 'ethereum',
    name: 'Ethereum',
    logo: EthereumLogo,
    component: Ethereum,
  },
  {
    type: 'uniswap/v2/pair',
    name: 'Uniswap V2 | Pair',
    logo: UniswapLogo,
    component: UniswapV2Pair,
  },
  {
    type: 'uniswap/v2/pair/stats',
    name: 'Uniswap V2 | Pair | Stats',
    logo: UniswapLogo,
    component: UniswapV2PairStats,
  },
  {
    type: 'erc20/token',
    name: 'ERC-20 | Token',
    logo: SolidityLogo,
    component: Erc20Token,
  },
];

const toolTypes: {
  type: string
  name: string
  logo: React.ComponentType<{width: number | string, height: number | string}>,
  component: React.ComponentType,
}[] = [
  {
    type: 'ethereum',
    name: 'Ethereum',
    logo: EthereumLogo,
    component: EthereumTool,
  },
  {
    type: 'uniswap/v2',
    name: 'Uniswap V2',
    logo: UniswapLogo,
    component: UniswapV2Tool,
  },
  {
    type: 'erc20',
    name: 'ERC-20',
    logo: SolidityLogo,
    component: Erc20Tool,
  },
];

export function DashboardPage() {
  const manager = React.useMemo(() => new DashboardManager(), [])

  const [revision, setRevision] = React.useState(Date.now())
  const [widgets, layouts] = React.useMemo(() => [manager.getWidgets(), manager.getLayouts()], [revision])
  useEffect(() => {
    const listener = () => {
      setRevision(Date.now())
    }
    manager.addEventListener(listener)
    return () => manager.removeEventListener(listener)
  })

  return <Box bgcolor='rgb(232, 235, 240)' display='flex' flexDirection='row' alignItems='stretch' flex={1}>
    <Box width={350} display='flex' flexDirection='column' gap={2} pt={2} pb={2}>
      <Box pr={2} pl={2}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <ListItem disablePadding>
              <ListItemIcon>
                <Api height={40} width={40} />
              </ListItemIcon>
              <ListItemText primary={"API"} />
            </ListItem>
          </AccordionSummary>
          <AccordionDetails style={{padding: 0}}>
            <APISettings />
          </AccordionDetails>
        </Accordion>
      </Box>
      <Divider  />
      <Box pr={2} pl={2}>
        {toolTypes.map(({
          type,
          name,
          component: Component,
          logo: Logo,
        }) => <Accordion key={type}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <ListItem disablePadding>
              <ListItemIcon>
                <Logo height={40} width={40} />
              </ListItemIcon>
              <ListItemText primary={name} />
            </ListItem>
          </AccordionSummary>
          <AccordionDetails style={{padding: 0}}>
            <Component />
          </AccordionDetails>
        </Accordion>)}
      </Box>
    </Box>
    <Divider orientation="vertical" />
    <ResponsiveReactGridLayout
      isDroppable
      droppingItem={{
        w: 3,
        h: 3,
        i: '__DROPPING_ITEM__',
      }}
      onDrop={(_, layout, e) => {
        e.preventDefault();
        const { type, payload } = JSON.parse((e as DragEvent).dataTransfer.getData('text/json'))
        manager.add({
          type,
          payload,
          layout,
        })
      }}
      breakpoint='lg'
      layouts={{lg: layouts}}
      onLayoutChange={(layout) => manager.updateLayout(layout)}
      style={{flex: 1, minHeight: '100vh'}}
      rowHeight={50}
      margin={[16, 16]}
      cols={{ lg: 12 }}>{widgets.map(({
        layout,
        type,
        payload,
      }) => <WidgetBox key={layout.i}>
        {(() => {
          const { component: Component } = widgetTypes.find(widgetType => widgetType.type === type)
          return <Component payload={payload} onRemove={() => manager.remove(layout.i)} onPayloadChange={(payload) => manager.update(layout.i, payload)} />
        })()}
      </WidgetBox>)}
    </ResponsiveReactGridLayout>
  </Box>
}
