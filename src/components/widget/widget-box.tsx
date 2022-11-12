import { styled } from "@mui/material";

export const WidgetBox = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  alignContent: 'stretch',
  ":hover": {
    background: 'rgba(255, 255, 255, 0.3)'
  },
});
