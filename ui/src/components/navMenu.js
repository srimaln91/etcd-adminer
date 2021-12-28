import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import StorageIcon from '@mui/icons-material/Storage';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Link } from "react-router-dom";
import List from '@mui/material/List';

export default function NavMenu(props) {

  return (
    <List>
      <ListItem button component={Link} to="connection">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Connection" />
      </ListItem>

      <ListItem button component={Link} to="cluster">
        <ListItemIcon>
          <StorageIcon />
        </ListItemIcon>
        <ListItemText primary="Cluster" />
      </ListItem>

      <ListItem button component={Link} to="keys">
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Keys" />
      </ListItem>

      <ListItem button>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Watchers" />
      </ListItem>

      <ListItem button>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users" />
      </ListItem>

      <ListItem button>
        <ListItemIcon>
          <LayersIcon />
        </ListItemIcon>
        <ListItemText primary="Roles" />
      </ListItem>
    </List>
  )
};
