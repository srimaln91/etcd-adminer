import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ConnectionCard from './connectionCard';
import { SessionStore } from '../storage/session'
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link } from "react-router-dom";
import DataService from '../data/service'
import Alert from '@mui/material/Alert';
import { Navigate } from "react-router-dom";

class ConnectionComponent extends React.Component {

    dataService;

    constructor(props) {
        super(props);

        this.sessionStore = new SessionStore();

        this.state = {
            backEnds: [],
            sessions: {},
            localSessionsFound: true,
            activeConnection: this.sessionStore.GetActiveSession(),
            errorMessage: ""
        }

        this.useSession = this.useSession.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
        this.dataService = new DataService();
    }

    useSession(session) {
        this.clearAlert();
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
        this.clearAlert();
        this.sessionStore.Delete(session);

        this.setState({
            sessions: this.sessionStore.GetAll()
        })
    }

    componentDidMount = async () => {

        let sessions = this.sessionStore.GetAll();
        if (sessions === null) {
            this.setState({
                localSessionsFound: false
            })
            sessions = {};
        }

        this.setState({
            sessions: sessions
        })

        try {
            let config = await this.dataService.GetConfig();
            let endpoints = [];
            config.clusters.forEach(backend => {
                let backendString = backend.endpoints.join(",") + backend.name;
                endpoints.push(backendString);
            });
            this.setState({
                endpoints: endpoints
            });
        } catch (error) {
            console.error(error);
            this.setState({
                errorMessage: "Something went wrong!"
            })
        }
    }

    getAlert = () => {
        if (this.state.errorMessage !== "") {
            return (<Alert severity="error">{this.state.errorMessage}</Alert>);
        }

        return null
    }

    clearAlert = () => {
        this.setState({
            errorMessage: "",
        })
    }

    render() {

        // Redirect to the new connection component if there are no location sessions
        if (!this.state.localSessionsFound) {
            return <Navigate to={"/connection/new"} replace={true} />
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

                        {this.getAlert()}

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