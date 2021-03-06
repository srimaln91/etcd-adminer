import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/system/Box';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { SessionStore, Session } from '../storage/session'
import DataService from '../data/service'

class NewConnectionComponent extends React.Component {

    dataService;

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            tested: false,
            success: false,
            error: false,
            errorMessage: "Something went wrong!",
            successMessage: "Success!",
            name: "",
            endpoints: "",
            username: "",
            password: "",
            sessions: {},
            activeConnection: {}
        }

        this.sessionStore = new SessionStore();

        this.handleTest = this.handleTest.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.useSession = this.useSession.bind(this);
        this.deleteSession = this.deleteSession.bind(this);

        this.dataService = new DataService();
    }

    handleTest = async() => {
        this.setState({
            loading: true,
            tested: false,
            success: false,
            error: false,
            successMessage: "",
            errorMessage: ""
        })

        try{
            let status = await this.dataService.TestConnection(this.state.username, this.state.password, this.state.endpoints);
            if(status === true){
                this.setState({
                    loading: false,
                    tested: true,
                    success: true,
                    successMessage: "Connection Succeeded!"
                })
            } else {
                this.setState({
                    loading: false,
                    tested: false,
                    success: false,
                    error: true,
                    successMessage: "",
                    errorMessage: "Invalid Credentials!"
                })
            }
        } catch(error){
            this.setState({
                loading: false,
                tested: false,
                success: false,
                error: true,
                successMessage: "",
                errorMessage: "Something Went Wrong!"
            })
        }
    }

    handleChange(e) {
        switch (e.target.name) {
            case "endpoints":
                this.setState({ endpoints: e.target.value })
                break;
            case "username":
                this.setState({ username: e.target.value })
                break;
            case "password":
                this.setState({ password: e.target.value })
                break;
            case "name":
                this.setState({ name: e.target.value })
                break;
            default:
                return;
        }
    }

    handleSubmit() {
        let session = new Session(
            this.state.name,
            this.state.endpoints,
            this.state.username,
            this.state.password
        );
        this.sessionStore.Add(session);

        // enable nav menu items
        this.props.forceRefreshNav();
        
        this.setState({
            sessions: this.sessionStore.GetAll()
        });
    }

    useSession(session) {
        this.sessionStore.SetActiveSession(session);

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

    componentDidMount = async() => {

        let sessions = this.sessionStore.GetAll();
        if (sessions === null) {
            sessions = {};
        }

        this.setState({
            username: localStorage.getItem('user'),
            password: localStorage.getItem('password'),
            name: localStorage.getItem('name'),
            sessions: sessions
        })

        try{
            let config = await this.dataService.GetConfig();
            this.setState({
                endpoints: config.endpoints.join(",")
            });
        }catch(error){
            // TODO: display an error
            console.error(error);
        }
    }

    alert(severity, message) {
        return (
            <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity={severity}>{message}</Alert>
            </Stack>
        )
    }

    render() {
        return (
            <Grid container spacing={3}>

                <Grid item xs={12} md={6} lg={6}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            New Connection
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={12} >
                                {this.state.success === true && this.state.successMessage !== "" ? this.alert("success", this.state.successMessage) : null}
                                {this.state.error === true && this.state.errorMessage !== "" ? this.alert("error", this.state.errorMessage) : null}
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    required
                                    id="name"
                                    name="name"
                                    label="Name"
                                    value={this.state.name}
                                    fullWidth
                                    autoComplete="given-name"
                                    variant="standard"
                                    onChange={this.handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    required
                                    disabled
                                    id="endpoints"
                                    name="endpoints"
                                    label="Endpoints"
                                    value={this.state.endpoints}
                                    fullWidth
                                    autoComplete="given-name"
                                    variant="standard"
                                    onChange={this.handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    id="username"
                                    name="username"
                                    label="User Name"
                                    value={this.state.username}
                                    fullWidth
                                    autoComplete="user name"
                                    variant="standard"
                                    onChange={this.handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    value={this.state.password}
                                    fullWidth
                                    autoComplete="current-password"
                                    variant="standard"
                                    onChange={this.handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <Box sx={{ '& > button': { m: 1, } }}>
                                    <LoadingButton
                                        onClick={this.handleTest}
                                        endIcon={<SendIcon />}
                                        loading={this.state.loading}
                                        loadingPosition="end"
                                        variant="contained"
                                        color="success"
                                    >
                                        Test
                                    </LoadingButton>
                                    <Button variant="contained" color="success" onClick={this.handleSubmit} sx={{ mt: 3, ml: 1 }} disabled={!this.state.tested}>
                                        Save
                                    </Button>
                                </Box>
                            </Grid>

                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        )
    }
}

export default NewConnectionComponent;