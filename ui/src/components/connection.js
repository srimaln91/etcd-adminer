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
import axios from 'axios';

class ConnectionComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            tested: false,
            success: false,
            error: false,
            errorMessage: "Something went wrong!",
            successMessage: "Success!",
            endpoints: "",
            username: "",
            password: ""
        }

        this.handleTest = this.handleTest.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleTest() {
        this.setState({
            loading: true,
            tested: false,
            success: false,
            error: false,
            successMessage: "",
            errorMessage: ""
        })

        axios.post(`http://localhost:8086/api/auth`, null, {
            auth: {
                username: this.state.username,
                password: this.state.password
            }
        })
            .then(res => {
                if (res.status == 200) {
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
            }).catch(err => {
                this.setState({
                    loading: false,
                    tested: false,
                    success: false,
                    error: true,
                    successMessage: "",
                    errorMessage: "Something Went Wrong!"
                })
            })

    }

    handleChange(e) {
        switch(e.target.name){
            case "endpoints":
                this.setState({endpoints: e.target.value})
                break;
            case "username":
                this.setState({username: e.target.value})
                break;
            case "password":
                this.setState({password: e.target.value})
                break;
            default:
                return;
        }
    }

    handleSubmit() {
        localStorage.setItem('user', this.state.username);
        localStorage.setItem('password', this.state.password);
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
                            flexDirection: 'column',
                            height: 800,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            Connection
                        </Typography>
                        <Grid container spacing={3}>
                        <Grid item xs={12} sm={12} >
                            {this.state.success === true && this.state.successMessage !== "" ? this.alert("success", this.state.successMessage): null}
                            {this.state.error === true && this.state.errorMessage !== "" ? this.alert("error", this.state.errorMessage): null}
                        </Grid>
                            <Grid item xs={12} sm={12}>
                                <TextField
                                    required
                                    id="endpoints"
                                    name="endpoints"
                                    label="Endpoints"
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

export default ConnectionComponent;