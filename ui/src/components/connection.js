import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ConnectionCard from './connectionCard';
import { SessionStore } from '../storage/session'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import Alert from '@mui/material/Alert';
import { Navigate } from "react-router-dom";

export default function Connection(props) {

    const sessionStore = new SessionStore();

    const [sessions, setSessions] = useState(new SessionStore().GetAll());
    const [errorMessage, seterrorMessage] = useState("");

    const useSession = (session) => {
        clearAlert();
        sessionStore.SetActiveSession(session);
        setSessions(sessionStore.GetAll());
    }

    const deleteSession = (session) => {
        clearAlert();
        sessionStore.Delete(session);
        setSessions(sessionStore.GetAll);
    }

    const getAlert = () => {
        if (errorMessage !== "") {
            return (<Alert severity="error">{errorMessage}</Alert>);
        }

        return null
    }

    const clearAlert = () => {
        seterrorMessage("");
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >

                    {getAlert()}

                    <Grid item xs={12} sm={12}>
                        <Typography variant="h6">
                            Saved Connections
                        </Typography>
                    </Grid>

                    {!sessionStore.IsLocalSessionAvailable() && (
                        <Navigate to={"/connection/new"} replace={true} />
                    )}

                    {
                    sessions !== null && Object.keys(sessions).map((key) => {
                        let conn = sessions[key];
                        return (
                            <Grid item xs={6} sm={3}>
                                <React.Fragment key={conn.Name + conn.UserName}>
                                    <ConnectionCard
                                        connection={conn}
                                        useSession={useSession}
                                        deleteSession={deleteSession}
                                        isActive={conn.isActive}
                                    />
                                </React.Fragment>
                            </Grid>
                        );
                    })}
                </Paper>
            </Grid>

            <Grid item xs={12} sm={12}>
                <Link to='new'>
                    <Fab color="primary" aria-label="add" sx={{ position: "absolute", bottom: 16, right: 16 }}>
                        <AddIcon />
                    </Fab>
                </Link>
            </Grid>

        </Grid>
    )
}
