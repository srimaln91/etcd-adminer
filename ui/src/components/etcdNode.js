import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function Node(props) {
    return (
        <Grid item xs={12} sm={6} md={4} lg={4}>
            <Card variant="outlined" sx={{ m: 1 }}>
                <React.Fragment>
                    <CardContent>
                        <Typography sx={{ mb: 1.5 }} color="text.primary">
                            Name: {props.name}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            ID: {props.ID}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            Is Learner: {props.isLearner? "true": "false"}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            Peer URLs: {props.peerUrls}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            Client URLs: {props.clientUrls}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            Leader Status: {props.isLeader}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            DB Size: {props.dbSize}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                            DB Size In Use: {props.dbSizeInUse}
                        </Typography>
                    </CardContent>
                </React.Fragment>
            </Card>
        </Grid>
    )
}
