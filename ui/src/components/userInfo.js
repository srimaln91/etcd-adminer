import React, { useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import DataService from '../data/service'

export default function UserInfo(props) {

    const [selectedRole, setSelectedRole] = React.useState('');
    const [user, setUser] = React.useState({ roles: [] });

    const dataService = new DataService();

    let fetchUser = async (username) => {
        try {
            let userDetails = await dataService.FetchUser(username);
            if(userDetails.roles == null) {
                userDetails.roles = [];
            }
            setUser(userDetails);
        } catch (error) {
            // TODO: display an error
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUser(props.userName);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.userName]);

    const handleClickChip = () => {
        // TODO: This should point user into the role details page
        console.info('You clicked the Chip.');
    };

    const handleClickAssignRole = async () => {
        try {
            let isSuccess = await dataService.AssignRole(user.name, selectedRole);
            if (isSuccess) {
                fetchUser(props.userName);
            }
        } catch (error) {
            // TODO: display an erro message
            console.error(error);
        }
    };

    const handleDelete = async (role) => {
        try {
            let isSuccess = await dataService.RemoveRole(user.name, role);
            if (isSuccess) {
                fetchUser(props.userName);
            }
        } catch (error) {
            console.error(error);
        }
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

                        {
                            ((user) => {
                                if(user.roles.length < 1 && user.name !== undefined) {
                                    return(<Alert severity="warning">No roles assigned!</Alert>)
                                } else{
                                    return(
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
                                    )
                                }
                            })(user)
                        }
                        
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Assign New Role:
                    </Typography>
                    <FormControl sx={{ m: 1, width: "100px" }}>
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
