import React, { useState, useEffect, useCallback, useMemo } from 'react';

import FSNavigator from './tree';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import EditorComponent from './editor';
import DataService from '../data/service'

export default function Keys(props) {
    const dataService = useMemo( () => new DataService(), []);

    const [activeKey, setActiveKey] = useState("/");
    const [keys, setKeys] = useState({ id: 'root', name: 'Parent' });
    const [isNewKey, setIsNewKey] = useState(false);

    const createVirtualFile = async (path) => {
        try {
            let fileTree = await dataService.CreateNode(path, false);
            setKeys(fileTree);
            setActiveKey(path);
            setIsNewKey(true);
        } catch (error) {
            //TODO: display an error message
            console.error(error);
        }
    }

    const createVirtualDirectory = async (path) => {
        try {
            let fileTree = await dataService.CreateNode(path, true);
            setKeys(fileTree);
        } catch (error) {
            //TODO: display an error message
            console.error(error);
        }
    }

    const deleteKey = async (node) => {
        try {
            let isSuccess = await dataService.DeleteNode(node.abspath, node.type === "directory");
            if (isSuccess) {
                fetchKeys();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchKeys = useCallback(async () => {
        try {
            let keys = await dataService.GetKeys();
            setKeys(keys);
        } catch (error) {
            // TODO: display an error
            console.error(error);
        }
    }, [dataService])

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys])

    return (
        <React.Fragment>
            <Grid container spacing={3}>

                <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 800,
                        }}
                    >
                        <FSNavigator
                            keys={keys}
                            onKeyClick={setActiveKey}
                            fetchKeys={fetchKeys}
                            createFile={createVirtualFile}
                            createDirectory={createVirtualDirectory}
                            deleteKey={deleteKey}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8} lg={9}>
                    <EditorComponent etcdKey={activeKey} isNewKey={isNewKey} />
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: "40px" }}>
                        {/* <Orders /> */}
                    </Paper>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}
