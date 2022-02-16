import {Snackbar, MuiAlert} from '@mui/material';

const useSnackBar = () => {

    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

    return (
        <Snackbar open={this.state.snackBarSuccess} autoHideDuration={6000} onClose={this.handleSnackBarClose}>
            <Alert severity="success" sx={{ width: '100%' }} onClose={this.handleSnackBarClose}>
                Successfully updated the key!
            </Alert>
        </Snackbar>
    )
}

export default useSnackBar;
