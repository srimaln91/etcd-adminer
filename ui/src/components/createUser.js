import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Input from '@mui/material/Input';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import DataService from '../data/service'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export default function CreateUser(props) {

    let dataService = new DataService();

    let formDefaults = {
        userName: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false
    };

    let [values, setValues] = React.useState(formDefaults);

    let [success, setSuccess] = React.useState(false);
    let [successMessage, setSuccessMessage] = React.useState("");
    let [error, setError] = React.useState(false);
    let [errorMessage, setErrorMessage] = React.useState("");
    let [roles, setRoles] = React.useState([]);
    let [availableRoles, setAvailableRoles] = React.useState([]);

    // Form field errors
    let [usernameError, setUsernameError] = React.useState(false);
    let [passwordError, setPasswodError] = React.useState(false);

    const handleSelectChange = (event) => {
        const {
            target: { value },
        } = event;
        setRoles(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    let clearMessages = () => {
        setUsernameError(false);
        setPasswodError(false);
        setSuccess(false);
        setSuccessMessage("");
        setError(false);
        setErrorMessage("");
    }

    let printErrorMessage = (message) => {
        setErrorMessage(message);
        setError(true);
    }

    let printSuccessMessage = (message) => {
        setSuccessMessage(message);
        setSuccess(true);
    }

    let handleChange = (prop) => (event) => {
        clearMessages();
        setValues({ ...values, [prop]: event.target.value });
    };

    let handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword,
        });
    };

    let handleClickShowConfirmPassword = () => {
        setValues({
            ...values,
            showConfirmPassword: !values.showConfirmPassword,
        });
    };

    let handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    let alert = (severity, message) => {
        return (
            <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity={severity}>{message}</Alert>
            </Stack>
        )
    }

    let handleSubmit = (e) => {
        e.preventDefault();
        clearMessages();

        let formErr = false;
        if (values.userName === "") {
            formErr = true;
            setUsernameError(true);
        }

        if (values.password === "") {
            formErr = true;
            setPasswodError(true);
        }

        if (values.password !== values.confirmPassword) {
            formErr = true;
            printErrorMessage("password and confirmation password fields are not identical");
        }

        if (formErr === true) {
            return;
        }

        // Create User
        try{
            let status = dataService.CreateUser(values.userName, values.password, roles);
            if(status){
                printSuccessMessage("User created Successfully");
                setValues(formDefaults);
            }
        }catch(error){
            console.error(error);
            printErrorMessage("User creation failed!");
        }
    }

    React.useEffect(() => {

        let fetchData = async() => {
            try {
                let roles = await dataService.GetRoles();
                setAvailableRoles(roles);
            }catch(error){
                alert(error);
            }
        }

        fetchData();

    });

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
                    <Typography variant="h6" gutterBottom>
                        New User
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }} >
                        <Grid item xs={12} sm={12} >
                            {success === true && successMessage !== "" ? alert("success", successMessage) : null}
                            {error === true && errorMessage !== "" ? alert("error", errorMessage) : null}
                        </Grid>

                        <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                            <InputLabel htmlFor="user-name">User Name</InputLabel>
                            <Input
                                required
                                id="user-name"
                                value={values.userName}
                                onChange={handleChange('userName')}
                                error={usernameError}
                            />
                        </FormControl>

                        <FormControl fullWidth sx={{ m: 1, mt: 3 }} variant="standard">
                            <InputLabel htmlFor="password">Password</InputLabel>
                            <Input
                                id="password"
                                type={values.showPassword ? 'text' : 'password'}
                                value={values.password}
                                onChange={handleChange('password')}
                                error={passwordError}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                        >
                                            {values.showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>

                        <FormControl fullWidth sx={{ m: 1, mt: 3 }} variant="standard">
                            <InputLabel htmlFor="confirm-password">Password</InputLabel>
                            <Input
                                id="confirm-password"
                                type={values.showConfirmPassword ? 'text' : 'password'}
                                value={values.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowConfirmPassword}
                                            onMouseDown={handleMouseDownPassword}
                                        >
                                            {values.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>

                        <FormControl sx={{ m: 1, mt: 3 }} fullWidth>
                            <InputLabel id="multi-select-label">Roles</InputLabel>
                            <Select
                                labelId="multi-select-label"
                                id="roles-multi-select"
                                multiple
                                value={roles}
                                onChange={handleSelectChange}
                                input={<OutlinedInput label="Tag" />}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                            >
                                {availableRoles.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={roles.indexOf(name) > -1} />
                                        <ListItemText primary={name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ '& > button': { m: 1 } }}>
                            <Button variant="contained" color="success" onClick={handleSubmit} sx={{ mt: 3, ml: 1 }}>
                                Save
                            </Button>
                        </Box>

                    </Box>
                </Paper>
            </Grid>
        </Grid>
    )
}
