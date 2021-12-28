import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Node from './node';
import axios from 'axios';

export default function ClusterInfo(props) {

    const [clusterInfo, setClusterInfo] = useState({ clusterInfo: {} });
    const [nodes, setNodes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await axios.get(`/api/clusterinfo`, {
                auth: {
                    username: localStorage.getItem("user"),
                    password: localStorage.getItem("password")
                },
                headers: {
                    "X-Endpoints": localStorage.getItem("endpoints")
                }
            }).then(res => {
                setClusterInfo(res.data);
                setNodes(res.data.nodes);
            }).catch(err => {
                console.error(err);
            })
        };

        fetchData();
    }, []);

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
                    <Typography variant="h6" gutterBottom>
                        Cluster Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid container item xs={12} sm={12}>
                            <Typography>Cluster ID: {clusterInfo.clusterID}</Typography>
                            <Typography>Member ID: {clusterInfo.memberID}</Typography>
                            <Typography>Raft Term: {clusterInfo.raftTerm}</Typography>
                            <Typography>Revision: {clusterInfo.revision}</Typography>
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