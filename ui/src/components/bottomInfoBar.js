import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { SessionStore } from '../storage/session'

export default function BottomInfoBar(props) {

  const sessionStore = new SessionStore();

  const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  return (
    <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', height: "50px" }}>
        <Stack direction="row" spacing={2}>
            <Item><b>Connection: </b> {sessionStore.GetActiveSession().Name}</Item>
            <Item><b>Endpoints: </b> {sessionStore.GetActiveSession().Endpoints} </Item>
            <Item><b>User: </b> {sessionStore.GetActiveSession().UserName}</Item>
        </Stack>
    </Paper>
  )
};
