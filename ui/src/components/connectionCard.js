import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function ConnectionCard(props) {
    const useSession = () => {
        props.useSession(props.connection);
    }

    const deleteSession = () => {
        props.deleteSession(props.connection);
    }

    return (
        <Card variant="outlined" sx={{m: 1}}>
            <React.Fragment>
                <CardContent>
                    <Typography variant="h5" component="div">
                        {props.connection.Name}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Endpoints: {props.connection.Endpoints}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        User: {props.connection.UserName}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="success" size="small" onClick={useSession}>Connect</Button>
                    <Button variant="contained" size="small">Edit</Button>
                    <Button variant="contained" color="error" size="small" onClick={deleteSession}>Delete</Button>
                </CardActions>
            </React.Fragment>
        </Card>
    );
}