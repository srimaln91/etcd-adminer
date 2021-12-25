import * as React from 'react';

import FileSystemNavigator from '../Tree';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Card  from '@mui/material/Card';
import EditorComponent from './editor';

class KeysComponent extends React.Component {
    render() {
        return (
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
                    <FileSystemNavigator />
                </Paper>
            </Grid>

            <Grid item xs={12} md={8} lg={9}>
                <EditorComponent/>
            </Grid>

            <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                    {/* <Orders /> */}
                </Paper>
            </Grid>
        </Grid>
        )
    }
}

export default KeysComponent;