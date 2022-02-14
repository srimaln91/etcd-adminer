import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import InfoIcon from '@mui/icons-material/Info';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Link } from "react-router-dom";
import List from '@mui/material/List';
import { SessionStore } from '../storage/session'

export default function NavMenu(props) {

  const sessionStore = new SessionStore();

  const isLocalSessionAvailable = () => {
    return sessionStore.IsLocalSessionAvailable();
  }

  return (
    <List>
      <ListItem button component={Link} to="connection">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Connection" />
      </ListItem>

      <ListItem button component={Link} to="cluster" disabled={!isLocalSessionAvailable()}>
        <ListItemIcon>
          <StorageIcon />
        </ListItemIcon>
        <ListItemText primary="Cluster" />
      </ListItem>

      <ListItem button component={Link} to="keys" disabled={!isLocalSessionAvailable()} >
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Keys" />
      </ListItem>

      <ListItem button component={Link} to="watchers" disabled>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Watchers" />
      </ListItem>

      <ListItem button component={Link} to="users" disabled={!isLocalSessionAvailable()}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users" />
      </ListItem>

      <ListItem button component={Link} to="roles" disabled>
        <ListItemIcon>
          <LayersIcon />
        </ListItemIcon>
        <ListItemText primary="Roles" />
      </ListItem>

      <ListItem button component={Link} to="about">
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary="About" />
      </ListItem>

    </List>
  )
};
