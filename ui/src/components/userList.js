import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ConfirmationDialog from './dialogs/confirmationDialog';
import UserInfo from './userInfo';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import UserTable from './userTable';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import DataService from '../data/service'

export default function UserList(props) {

    const dataService = new DataService();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [showRightPane, setShowRightPain] = useState(false);
    const [roles, setRoles] = useState([]);
    const [deleteConfirmationDialogOpen, setdeleteConfirmationDialogOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    });

    let onConfirmationDialogCancel = () => {
        setdeleteConfirmationDialogOpen(false)
    }

    let onConfirmationDialogConfirm = () => {
        setdeleteConfirmationDialogOpen(false);
        deleteUser(selectedUser);
    }

    let getDeleteDialogContent = () => {
        return "Do you really want to delete this user?"
    }

    let fetchUsers = async () => {
        try {
            let users = await dataService.GetUsers();
            setUsers(users);
        } catch (error) {
            if (error.response.status === 403) {
                setErrorMessage("Permission Denied!");
            } else {
                setErrorMessage("Something went wrong!");
            }
        }
    };

    let fetchRoles = async () => {
        try {
            let roles = await dataService.GetRoles();
            setRoles(roles);
        } catch (error) {
            if (error.response.status === 403) {
                setErrorMessage("Error fetching roles. Permission Denied!");
            } else {
                setErrorMessage("Something went wrong!");
            }
        }
    };

    let deleteUser = async (user) => {
        try {
            let isDeleted = await dataService.DeleteUser(user);
            if (isDeleted) {
                fetchUsers();
            }
        } catch (error) {
            //TODO: display an error
            console.error(error);
        }
    };

    let selectUser = (user) => {
        setSelectedUser(user);
        setShowRightPain(true);
    }

    let getUserTable = () => {
        return (
            <UserTable
                users={users}
                setSelectedUser={setSelectedUser}
                setdeleteConfirmationDialogOpen={setdeleteConfirmationDialogOpen}
                selectUser={selectUser}
            />
        )
    }

    return (
        <Grid container spacing={3}>

            <Grid item xs={12} md={6} lg={6}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Grid container spacing={1}>
                        <Grid xs={12} sm={12}>
                            <Typography variant="h6" gutterBottom>
                                Users
                            </Typography>
                            <Stack sx={{ width: '100%' }} spacing={2}>
                                {errorMessage !== "" ? <Alert severity="error">{errorMessage}</Alert> : ""}
                            </Stack>
                        </Grid>

                    </Grid>
                    <Grid container item xs={12} sm={12}>
                        {users.length > 0 ? getUserTable() : null}
                    </Grid>
                    <Grid xs={12} sm={12}>
                        <Link to='new'>
                            <Fab color="primary" aria-label="add" sx={{ position: "absolute", bottom: 16, right: 16 }}>
                                <AddIcon />
                            </Fab>
                        </Link>
                    </Grid>
                </Paper>

            </Grid>

            {showRightPane && (
                <Grid item xs={12} md={6} lg={6}>
                    <UserInfo key={selectedUser} allRoles={roles} userName={selectedUser} />
                </Grid>
            )}

            <ConfirmationDialog
                open={deleteConfirmationDialogOpen}
                onCancel={onConfirmationDialogCancel}
                onConfirm={onConfirmationDialogConfirm}
                title={"Delete User?"}
                content={getDeleteDialogContent()}
            />

        </Grid>
    )
}
