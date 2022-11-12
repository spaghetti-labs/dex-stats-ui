import { Close, DataObject, MoreVert, PhotoSizeSelectSmall, Refresh, Settings } from "@mui/icons-material";
import { Box, Breadcrumbs, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, styled, Typography } from "@mui/material";
import { DocumentNode, print } from "graphql";
import * as React from "react";
import { MouseEvent } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function GraphQL({
  node,
}: {
  node: DocumentNode,
}) {
  const text = React.useMemo(() => {
    return print(node);
  }, [node]);
  return <SyntaxHighlighter customStyle={{margin: 0}} showLineNumbers language="graphql" style={materialDark}>
    {text}
  </SyntaxHighlighter>
}

function checkOverflow(element: HTMLDivElement): boolean {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
}

function useHasOverflow(ref: React.MutableRefObject<HTMLDivElement>) {
  const [hasOverflow, setHasOverflow] = React.useState(false)

  React.useLayoutEffect(() => {
    const { current: element } = ref;
    if (element == null) {
      setHasOverflow(null)
      return
    }
    setHasOverflow(checkOverflow(element));
    const observer = new ResizeObserver(() => setHasOverflow(checkOverflow(element)))
    observer.observe(element)
    return () => observer.unobserve(element);
  }, [ref])

  return hasOverflow
}

const StyledBreadcrumbs = styled(Breadcrumbs)`
  -webkit-mask-image: linear-gradient(90deg, #000 60%, transparent);
  overflow: hidden;
  .MuiBreadcrumbs-ol {
    flex-wrap: nowrap;
  }
  .MuiBreadcrumbs-li {
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  };
`;

export function WidgetContainer({
  children,
  graphql,
  onRemove,
  onRefresh,
  settings,
  logo: Logo,
  breadcrumbs,
  disableOverflow = false,
}: {
  children?: any,
  graphql?: DocumentNode,
  onRemove?: () => void,
  onRefresh?: () => void,
  settings?: React.ReactNode,
  logo?: React.ComponentType<{width: number | string, height: number | string}>,
  breadcrumbs?: React.ReactNode[],
  disableOverflow?: boolean,
}) {
  const [openGraphql, setOpenGraphql] = React.useState(false)

  const ref = React.useRef<HTMLDivElement>()
  const hasOverflow = !disableOverflow && useHasOverflow(ref)

  const [openSettings, setOpenSettings] = React.useState(false)

  return <>
    <Paper style={{flex: 1, cursor: 'move', display: 'flex', overflow: 'hidden', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center'}}>
      <Box className="draggable-handle" alignSelf='stretch' display='flex' flexDirection='row' p={1} alignItems='center' height='48px'>
        {Logo != null && <Logo width={20} height={20} />}
        {breadcrumbs != null && <StyledBreadcrumbs style={{ padding: 4, flex: 1 }}>
          {breadcrumbs.map((breadcrumb, i) => <Typography noWrap key={i}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            color="inherit"
            children={breadcrumb}
          />)}
        </StyledBreadcrumbs>}
        <ButtonGroup size="small" className="draggable-cancel" style={{cursor: 'auto'}}>
          {graphql != null && <IconButton size="small" onClick={() => setOpenGraphql(true)}>
            <DataObject fontSize="small" />
          </IconButton>}
          {settings != null && <IconButton size="small" onClick={() => {setOpenSettings(true)}}>
            <Settings fontSize="small" />
          </IconButton>}
          {onRefresh != null && <IconButton size="small" onClick={() => {onRefresh();}}>
            <Refresh fontSize="small" />
          </IconButton>}
          {onRemove != null && <IconButton size="small" onClick={() => {onRemove();}}>
            <Close fontSize="small" />
          </IconButton>}
        </ButtonGroup>
      </Box>
      <Box style={{cursor: 'auto'}} flex={1} position='relative' display='flex' overflow='hidden' flexDirection='column' alignItems='center' justifyContent='center' ref={ref}>
        {children}
        {hasOverflow && <Box position='absolute' top={0} left={0} bottom={0} right={0} display='flex' flexDirection='column' alignItems='center' justifyContent='center' bgcolor='white'>
          <PhotoSizeSelectSmall />
        </Box>}
      </Box>
    </Paper>

    {graphql != null && <Dialog
      maxWidth={false}
      open={openGraphql}
      onClose={() => setOpenGraphql(false)}
      scroll={'paper'}
    >
      <DialogTitle>GraphQL</DialogTitle>
      <DialogContent dividers style={{padding: 0}}>
        <GraphQL node={graphql} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenGraphql(false)}>Close</Button>
      </DialogActions>
    </Dialog>}

    {settings != null && <Dialog
      maxWidth={false}
      open={openSettings}
      onClose={() => setOpenSettings(false)}
      scroll={'paper'}
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent dividers children={settings} />
      <DialogActions>
        <Button onClick={() => setOpenSettings(false)}>Close</Button>
      </DialogActions>
    </Dialog>}
  </>
}
