import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

    const sessionStore = useMemo(() => {
        return new SessionStore();
    }, [])

    const [sessions, setsessions] = useState({});
    const [localSessionsFound, setlocalSessionsFound] = useState(true);
    const [activeConnection, setactiveConnection] = useState({});
    const [errorMessage, seterrorMessage] = useState("");

    const useSession = (session) => {

        clearAlert();

        sessionStore.SetActiveSession(session);
        setactiveConnection(session);

        localStorage.setItem('endpoints', session.Endpoints);
        localStorage.setItem('user', session.UserName);
        localStorage.setItem('password', session.Password);
        localStorage.setItem('name', session.Name);
    }

    const deleteSession = (session) => {
        clearAlert();
        sessionStore.Delete(session);
        setsessions(this.sessionStore.GetAll());
    }

    const fetchData = useCallback(async () => {
        let sessions = sessionStore.GetAll();
        if (sessions === null) {
            setlocalSessionsFound(false);
            sessions = {};
        }

        setsessions(sessions);
    }, [sessionStore])

    useEffect(() => {
        fetchData();
    }, [props, fetchData]);

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

                    {!localSessionsFound && (
                        <Navigate to={"/connection/new"} replace={true} />
                    )}

                    {Object.keys(sessions).map((key) => {
                        let conn = sessions[key];
                        return (
                            <Grid item xs={6} sm={3}>
                                <React.Fragment key={conn.Name + conn.UserName}>
                                    <ConnectionCard
                                        connection={conn}
                                        useSession={useSession}
                                        deleteSession={deleteSession}
                                        isActive={activeConnection.Name === conn.Name}
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
