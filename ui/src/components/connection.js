import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import ConnectionCard from './connectionCard';
import { SessionStore } from '../storage/session'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";

class ConnectionComponent extends React.Component {

    constructor(props) {
        super(props);

        this.sessionStore = new SessionStore();

        this.state = {
            sessions: {},
            activeConnection: this.sessionStore.GetActiveSession()
        }
        
        this.useSession = this.useSession.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
    }

    useSession(session) {
        this.sessionStore.SetActiveSession(session);
        this.setState({
            activeConnection: session
        });

        localStorage.setItem('endpoints', session.Endpoints);
        localStorage.setItem('user', session.UserName);
        localStorage.setItem('password', session.Password);
        localStorage.setItem('name', session.Name);

    }

    deleteSession(session) {
        this.sessionStore.Delete(session);

        this.setState({
            sessions: this.sessionStore.GetAll()
        })
    }

    componentDidMount() {

        let sessions = this.sessionStore.GetAll();
        if (sessions === null) {
            sessions = {};
        }

        this.setState({
            sessions: sessions
        })

        // Fetch available endpoints
        axios.get(`/api/getconfig`)
            .then(res => {
                let endpoints = res.data.endpoints;
                this.setState({
                    endpoints: endpoints.join(",")
                });
            })
    }

    render() {
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

                        <Grid item xs={12} sm={12}>
                            <Typography variant="h6">
                                Saved Connections
                            </Typography>
                        </Grid>

                        {Object.keys(this.state.sessions).map((key) => {
                            let conn = this.state.sessions[key];
                            return (
                                <Grid item xs={6} sm={3}>
                                    <React.Fragment key={conn.Name + conn.UserName}>
                                        <ConnectionCard
                                            connection={conn}
                                            useSession={this.useSession}
                                            deleteSession={this.deleteSession}
                                            isActive={this.state.activeConnection.Name === conn.Name}
                                        />
                                    </React.Fragment>
                                </Grid>
                            );
                        })}
                    </Paper>
                </Grid>

                <Grid xs={12} sm={12}>
                    <Link to='new'>
                        <Fab color="primary" aria-label="add" sx={{ position: "absolute", bottom: 16, right: 16 }}>
                            <AddIcon />
                        </Fab>
                    </Link>
                </Grid>

            </Grid>
        )
    }
}

export default ConnectionComponent;