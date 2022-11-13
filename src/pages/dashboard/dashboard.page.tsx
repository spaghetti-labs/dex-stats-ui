import * as React from "react";
import { Ethereum } from "../../components/ethereum/ethereum";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, Card, Container, Divider, Drawer, IconButton, Input, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, styled, Tab, Tabs, TextField, Typography } from "@mui/material";
import { UniswapV2Pair } from "../../components/uniswap-v2/uniswap-v2-pair";
import { UniswapV2PairStats } from "../../components/uniswap-v2/uniswap-v2-stats";
import * as _ from "lodash";
import { ReactComponent as UniswapLogo } from '../../assets/uniswap.svg'
import { ReactComponent as EthereumLogo } from '../../assets/ethereum.svg'
import { ReactComponent as SolidityLogo } from '../../assets/solidity.svg'
import { Add, Api, Close, Edit, ExpandMore, Save } from "@mui/icons-material";
import { useMemo } from "react";
import { useEffect } from "react";
import { UniswapV2Tool } from "../../components/uniswap-v2/uniswap-v2-tool";
import { EthereumTool } from "../../components/ethereum/ethereum-tool";
import { Erc20Tool } from "../../components/erc20/erc20-tool";
import { Erc20Token } from "../../components/erc20/erc20-token";
import { WidgetBox } from "../../components/widget/widget-box";
import { APISettings } from "../../components/api/api-settings";
import { DashboardManager } from "./dashboard-manager";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

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

export function DashboardTabLabel({
  title,
  onRename,
  onDelete,
}: {
  title: string,
  onRename: (title: string) => void,
  onDelete: () => void,
}) {
  const [unsavedTitle, setUnsavedTitle] = React.useState<string>(null)
  return <>
    {unsavedTitle == null && <Typography variant="button" noWrap textOverflow='ellipsis' pr={1}>
      {title}
    </Typography>}
    {unsavedTitle != null && <Input
      size="small"
      margin="dense"
      onChange={e => setUnsavedTitle(e.target.value)}
      inputProps={{style:{paddingBottom: '4px'}}}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      value={unsavedTitle} />}

    {unsavedTitle == null && <IconButton size="small" onClick={(e) => {
      setUnsavedTitle(title)
      e.stopPropagation()
    }}><Edit fontSize="inherit" /></IconButton>}
    {unsavedTitle != null && <IconButton size="small" onClick={(e) => {
      onRename(unsavedTitle)
      setUnsavedTitle(null)
      e.stopPropagation()
    }}><Save fontSize="inherit" /></IconButton>}

    <IconButton disabled={unsavedTitle != null} size="small" onClick={(e) => {
      onDelete()
      e.stopPropagation()
    }}><Close fontSize="inherit" /></IconButton>
  </>
}

export function DashboardPage() {
  const manager = React.useMemo(() => new DashboardManager(), [])

  const [revision, setRevision] = React.useState(Date.now())

  const dashboards = React.useMemo(() => manager.getDashboards(), [revision, manager])
  const [dashboardIndex, setDashboardIndex] = React.useState(0)

  const {dashboard, widgets, layouts} = React.useMemo(() => {
    if (dashboardIndex >= dashboards.length) {
      return {}
    }
    const dashboard = dashboards[dashboardIndex]
    if (dashboard == null) {
      return {}
    }
    return {
      dashboard,
      widgets: manager.getWidgets(dashboard.id),
      layouts: manager.getLayouts(dashboard.id)
    }
  }, [manager, dashboards, revision, dashboardIndex])

  useEffect(() => {
    if (dashboard == null) {
      setDashboardIndex(dashboards.length - 1)
    }
  }, [dashboard, dashboards])

  useEffect(() => {
    const listener = () => {
      setRevision(Date.now())
    }
    manager.addEventListener(listener)
    return () => manager.removeEventListener(listener)
  }, [manager])

  return <Box bgcolor='rgb(232, 235, 240)' display='flex' flexDirection='row' alignItems='stretch' flex={1} overflow='hidden'>
    <Box width={350} display='flex' flexDirection='column' gap={2} pt={2} pb={2} overflow='auto'>
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
      <Box flex={1} pr={2} pl={2}>
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
    <Box display='flex' flexDirection='column' alignItems='stretch' flex={1} overflow='hidden'>
      <Box display='flex' flexDirection='row' alignItems='center' gap={2} pl={2} pr={2} overflow='hidden' height='52px'>
        {dashboards.length > 0 && <Tabs
          style={{flexShrink: 1}}
          value={dashboard?.id}
          onChange={(_, dashboardId) => setDashboardIndex(dashboards.findIndex(dashboard => dashboard.id === dashboardId))}
          variant="scrollable">
          {dashboards.map(dashboard => <Tab
            style={{minHeight: 'auto'}}
            iconPosition='end'
            label={<DashboardTabLabel
              title={dashboard.title}
              onRename={title => manager.updateDashboardTitle(dashboard.id, title)}
              onDelete={() => manager.removeDashboard(dashboard.id)} />}
            value={dashboard.id}
          />)}
        </Tabs>}
        {dashboards.length > 0 && <>
          <Divider orientation="vertical" />
          <IconButton size="small" onClick={() => manager.addDashboard({ title: 'New Dashboard' })}><Add fontSize="small" /></IconButton>
        </>}
        {dashboards.length === 0 && <Button onClick={() => manager.addDashboard({ title: 'New Dashboard' })} endIcon={<Add />}>
          Add Dashboard
        </Button>}
      </Box>
      <Divider />
      <Box overflow='auto' flex={1}>
        {dashboard != null && <ResponsiveReactGridLayout
          style={{
            minHeight: '100%'
          }}
          draggableHandle='.draggable-handle'
          draggableCancel='.draggable-cancel'
          isDroppable
          droppingItem={{
            w: 3,
            h: 3,
            i: '__DROPPING_ITEM__',
          }}
          onDrop={(_, layout, e) => {
            e.preventDefault();
            const { type, payload } = JSON.parse((e as DragEvent).dataTransfer.getData('text/json'))
            manager.addWidget(dashboard.id, {
              type,
              payload,
              layout,
            })
          }}
          breakpoint='lg'
          layouts={{lg: layouts}}
          onLayoutChange={(layout) => manager.updateDashboard(dashboard.id, layout)}
          rowHeight={50}
          margin={[16, 16]}
          cols={{ lg: 12 }}>{widgets.map(({
            layout,
            type,
            payload,
          }) => <WidgetBox key={layout.i}>
            {(() => {
              const { component: Component } = widgetTypes.find(widgetType => widgetType.type === type)
              return <Component payload={payload} onRemove={() => manager.removeWidget(dashboard.id, layout.i)} onPayloadChange={(payload) => manager.updateWidget(dashboard.id, layout.i, payload)} />
            })()}
          </WidgetBox>)}
        </ResponsiveReactGridLayout>}
      </Box>
    </Box>
  </Box>
}
