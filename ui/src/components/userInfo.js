import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import axios from 'axios';


export default function UserInfo(props) {

    const [selectedRole, setSelectedRole] = React.useState('');
    const [user, setUser] = React.useState({roles: []});


    useEffect(() => {
        fetchUser(props.userName);
    }, []);

    let fetchUser = async (username) => {
        await axios.get(`/api/users/` + username, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            setUser(res.data);
        }).catch(err => {
            console.error(err);
        })
    };

    let assignRole = (user, role) => {
        return new Promise((resolve, reject) => {
            axios.post(`/api/users/` + user + `/role/` + role, null, {
                auth: {
                    username: localStorage.getItem("user"),
                    password: localStorage.getItem("password")
                },
                headers: {
                    "X-Endpoints": localStorage.getItem("endpoints")
                }
            }).then(res => {
                if (res.status === 200) {
                    // Add role the user
                    resolve(true);
                    return;
                }
                reject(Error("something went wrong!"));
            }).catch(err => {
                reject(err);
            })
        })

    }

    let unAssignRole = (user, role) => {
        return new Promise((resolve, reject) => {
            axios.delete(`/api/users/` + user + `/role/` + role, {
                auth: {
                    username: localStorage.getItem("user"),
                    password: localStorage.getItem("password")
                },
                headers: {
                    "X-Endpoints": localStorage.getItem("endpoints")
                }
            }).then(res => {
                if (res.status === 200) {
                    resolve(true);
                    return;
                }
                reject(Error("something went wrong!"));
            }).catch(err => {
                reject(err);
            })
        })
    }

    const handleClickChip = () => {
        // TODO: This should point user into the role details page
        console.info('You clicked the Chip.');
    };

    const handleClickAssignRole = () => {
        assignRole(user.name, selectedRole).then(() => {
            fetchUser(props.userName);
        })
    };

    const handleDelete = (role) => {
        unAssignRole(user.name, role).then(()=>{
            fetchUser(props.userName);
        })
    };

    const getRoles = () => {
        return props.allRoles.filter(element => !user.roles.includes(element));
    };

    const handleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    return (
        <Paper
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h6" gutterBottom>
                User Info: {user.name}
            </Typography>
            <Grid container item xs={12} sm={12}>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Roles:
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Paper
                        sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            flexWrap: 'wrap',
                            listStyle: 'none',
                            p: 2,
                            m: 2,
                        }}
                    >
                        <Stack direction="row" spacing={1}>
                            {user.roles.map((role) => (
                                <Chip
                                    key={role}
                                    label={role}
                                    variant="outlined"
                                    onClick={handleClickChip}
                                    onDelete={() => { handleDelete(role) }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Assign New Role:
                    </Typography>
                    <FormControl sx={{ m: 1 }}>
                        <InputLabel id="demo-simple-select-label">Roles</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedRole}
                            label="Roles"
                            onChange={handleChange}
                            autoWidth
                        >
                            {getRoles().map((role) => (
                                <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ m: 1 }}>
                        <Button variant="contained" color="success" onClick={handleClickAssignRole}>
                            Assign
                        </Button>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    )
}