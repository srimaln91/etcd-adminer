import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { SessionStore, Session } from '../storage/session'
import DataService from '../data/service'

export default function NewConnection(props) {

    const dataService = useMemo(() => { return new DataService()}, []);
    const sessionStore = useMemo(() => { return new SessionStore()}, []);

    const [loading, setloading] = useState(false);
    const [tested, settested] = useState(false);
    const [success, setsuccess] = useState(false);
    const [error, seterror] = useState(false);
    const [errorMessage, seterrorMessage] = useState("Something went wrong!");
    const [successMessage, setsuccessMessage] = useState("Success!");
    const [name, setname] = useState("");
    const [backEnds, setbackEnds] = useState([]);
    const [selectedBackendIndex, setselectedBackendIndex] = useState(0);
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");

    const handleTest = async() => {
        setloading(true);
        settested(false);
        setsuccess(false);
        seterror(false);
        seterrorMessage("");
        setsuccessMessage("");

        try {
            let status = await dataService.TestConnection(username, password, backEnds[selectedBackendIndex].name);
            if (status === true) {
                setloading(false);
                settested(true);
                setsuccess(true);
                setsuccessMessage("Connection Succeeded!");
            } else {
                setloading(false);
                settested(false);
                setsuccess(false);
                seterror(true);
                seterrorMessage("Invalid Credentials!");
                setsuccessMessage("");
            }
        } catch (error) {
            setloading(false);
            settested(false);
            setsuccess(false);
            seterror(true);
            seterrorMessage("Something Went Wrong!");
            setsuccessMessage("");
        }
    }

    const handleChange = (e) => {
        let value = e.target.value;
        switch (e.target.name) {
            case "backend":
                setselectedBackendIndex(value);
                break;
            case "username":
                setusername(value);
                break;
            case "password":
                setpassword(value);
                break;
            case "name":
                setname(value);
                break;
            default:
                return;
        }
    }

    const handleSubmit = () => {
        let newSession = new Session(
            name,
            backEnds[selectedBackendIndex].name,
            backEnds[selectedBackendIndex].endpoints,
            username,
            password
        );

        sessionStore.Add(newSession);
        submitSession(newSession);

        // enable nav menu items
        props.forceRefreshNav();
    }

    const submitSession = (session) => {

        let storeSession = sessionStore.Get(session.Name);
        if (storeSession === undefined || storeSession === {}){
            setloading(false);
            settested(false);
            setsuccess(false);
            seterror(true);
            seterrorMessage("Could not find the local session!");
            setsuccessMessage("");

            return;
        }

        sessionStore.SetActiveSession(storeSession);
    }

    const fetchData = useCallback(async () => {
        try {
            let config = await dataService.GetConfig();

            let backEnds = [];
            config.clusters.forEach(cluster => {
                backEnds.push({ endpoints: cluster.endpoints, name: cluster.name });
            })

            setbackEnds(backEnds);
            setselectedBackendIndex(undefined);

        } catch (error) {
            // TODO: display an error
            console.error(error);
        }
    }, [dataService])

    useEffect(() => {
        fetchData();
    }, [fetchData])

    const alert = (severity, message) => {
        return (
            <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity={severity}>{message}</Alert>
            </Stack>
        )
    }

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
                            {success === true && successMessage !== "" ? alert("success", successMessage) : null}
                            {error === true && errorMessage !== "" ? alert("error", errorMessage) : null}
                            {loading === true ? alert("warning", "Checking...") : null}
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                required
                                id="name"
                                name="name"
                                label="Name"
                                value={name}
                                fullWidth
                                autoComplete="given-name"
                                variant="standard"
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <FormControl fullWidth>
                                <InputLabel id="backend-lbl">BackEnd</InputLabel>
                                <Select
                                    labelId="backend-lbl"
                                    id="backend"
                                    value={selectedBackendIndex !== undefined ? selectedBackendIndex: ""}
                                    label="Backend"
                                    name="backend"
                                    onChange={handleChange}
                                >
                                    {
                                        backEnds.map((be, i) => {
                                            return <MenuItem key={i} value={i}>{be.name + "[" + be.endpoints + "]"}</MenuItem>
                                        })
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                id="username"
                                name="username"
                                label="User Name"
                                value={username}
                                fullWidth
                                autoComplete="user name"
                                variant="standard"
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                value={password}
                                fullWidth
                                autoComplete="current-password"
                                variant="standard"
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <Box sx={{ '& > button': { m: 1, } }}>
                                <LoadingButton
                                    onClick={handleTest}
                                    endIcon={<SendIcon />}
                                    loading={loading}
                                    loadingPosition="end"
                                    variant="contained"
                                    color="success"
                                >
                                    Test
                                </LoadingButton>
                                <Button variant="contained" color="success" onClick={handleSubmit} sx={{ mt: 3, ml: 1 }} disabled={!tested}>
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
