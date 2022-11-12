import * as React from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Hub } from '@mui/icons-material';

export function EthereumTool() {
  return <Box width='100%' height='100%' display='flex' flexDirection='column' gap={2} justifyContent='center' alignContent='center' overflow='hidden'>
    <List>
      <ListItemButton sx={{ pl: 4, cursor: 'move' }} draggable onDragStart={e => {
          e.dataTransfer.setData("text/json", JSON.stringify({
            type: 'ethereum',
            payload: {},
          }))
        }}>
        <ListItemIcon>
          <Hub />
        </ListItemIcon>
        <ListItemText primary="Network info" />
      </ListItemButton>
    </List>
  </Box>
}
