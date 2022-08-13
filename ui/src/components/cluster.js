import React, { useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Node from './etcdNode';
import DataService from '../data/service'
import Alert from '@mui/material/Alert';

export default function ClusterInfo(props) {

    const [clusterInfo, setClusterInfo] = useState({ clusterInfo: {} });
    const [errorMessage, setErrorMessage] = useState("");

    const fetchData = useCallback(async() => {
        try {
            let clusterInfo = await new DataService().GetClusterInfo();
            setClusterInfo(clusterInfo);
            setErrorMessage("");
        } catch (err) {
            console.error(err);
            setErrorMessage("Something went wrong!")
        }
      }, [])

    useEffect(() => {
        fetchData();

    }, [props, fetchData]);

    const getAlert = () => {
        if (errorMessage !== "") {
            return (<Alert severity="error">{errorMessage}</Alert>);
        }

        return null
    }

    return (
        <Grid container spacing={3}>

            <Grid item xs={12} md={6} lg={6}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 200,
                    }}
                >

                    {getAlert()}

                    <Typography variant="h6" gutterBottom>
                        Cluster Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid container item xs={12} sm={12}>
                            <Grid item xs={4}>
                                <Typography>Cluster ID:</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>{clusterInfo.clusterID}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>Member ID:</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>{clusterInfo.memberID}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>Raft Term:</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>{clusterInfo.raftTerm}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>Revision:</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>{clusterInfo.revision}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 800,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Nodes
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid container item xs={12} sm={12}>
                            {clusterInfo.nodes && clusterInfo.nodes.map(node => {
                                return (
                                    <Node
                                        key={node.ID}
                                        name={node.name}
                                        ID={node.ID}
                                        isLearner={node.isLearner}
                                        peerUrls={node.peerUrls}
                                        clientUrls={node.clientUrls}
                                        isLeader={node.isLeader}
                                        dbSize={node.dbSize}
                                        dbSizeInUse={node.dbSizeInUse}
                                    />
                                )
                            })}

                        </Grid>
                    </Grid>
                </Paper>

            </Grid>
        </Grid>
    )
}
