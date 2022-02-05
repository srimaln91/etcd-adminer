import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import ConfirmationDialog from './dialogs/confirmationDialog';
import UserInfo from './userInfo';
import axios from 'axios';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";


export default function UserList(props) {

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [showRightPane, setShowRightPain] = useState(false);
    const [roles, setRoles] = useState([]);
    const [deleteConfirmationDialogOpen, setdeleteConfirmationDialogOpen] = React.useState(false);


    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

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
        await axios.get(`/api/users`, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            setUsers(res.data);
        }).catch(err => {
            console.error(err);
        })
    };

    let fetchRoles = async () => {
        await axios.get(`/api/role`, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            setRoles(res.data);
        }).catch(err => {
            console.error(err);
        })
    };


    let deleteUser = async (user) => {
        await axios.delete(`/api/users/` + user, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            fetchUsers();
        }).catch(err => {
            console.error(err);
        })
    };

    let selectUser = (user) => {
        setSelectedUser(user);
        setShowRightPain(true);
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
                        <Grid xs={6} sm={6}>
                            <Typography variant="h6" gutterBottom>
                                Users
                            </Typography>
                        </Grid>

                    </Grid>
                    <Grid container item xs={12} sm={12}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((row) => (
                                        <TableRow
                                            key={row}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {row}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button sx={{ m: 1 }} variant="contained" color="success" onClick={() => { selectUser(row) }}>View/Edit</Button>
                                                <Button sx={{ m: 1 }} variant="contained" color="error" onClick={() => {
                                                    setSelectedUser(row);
                                                    setdeleteConfirmationDialogOpen(true);
                                                }}>Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    <Grid xs={12} sm={12}>
                        <Link to='new'>
                            <Fab color="primary" aria-label="add" sx={{position: "absolute", bottom: 16, right: 16}}>
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
