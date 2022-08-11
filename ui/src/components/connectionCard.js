import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import { red } from '@mui/material/colors';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const ITEM_HEIGHT = 48;

export default function ConnectionCard(props) {


    const useSession = () => {
        props.useSession(props.connection);
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleOptionMenuBtnClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleOptionClose = () => {
        setAnchorEl(null);
    };

    let options = [
        {
            name: "Connect",
            onClick: () => {
                connect(props.connection);
                setAnchorEl(null);
            }
        },
        {
            name: "Delete",
            onClick: () => {
                deleteConnection();
                setAnchorEl(null);
            }
        }
    ];

    const connect = (session) => {
        props.useSession(session);
    }

    const deleteConnection = () => {
        props.deleteSession(props.connection);
    }

    return (
        <Card variant="outlined" sx={{ maxWidth: 345, m: 1 }}>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                        {props.connection.UserName.charAt(0).toUpperCase()}
                    </Avatar>
                }
                action={
                    <IconButton aria-label="settings" onClick={handleOptionMenuBtnClick}>
                        <MoreVertIcon />
                    </IconButton>
                }
                title={props.connection.Name}
            />
            <CardContent>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Cluster: {props.connection.BackEnd}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Endpoints: {props.connection.Endpoints}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    User: {props.connection.UserName}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Is Active: {props.isActive ? "true" : "false"}
                </Typography>
            </CardContent>
            <CardActions>
                <Button disabled={props.isActive} variant="contained" color="success" size="small" onClick={useSession}>Connect</Button>
            </CardActions>

            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleOptionClose}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 4.5,
                        width: '20ch',
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.name} onClick={option.onClick}>
                        {option.name}
                    </MenuItem>
                ))}
            </Menu>

        </Card>
    );
}