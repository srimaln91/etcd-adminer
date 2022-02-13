import * as React from 'react';

import FSNavigator from './tree';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import EditorComponent from './editor';
import DataService from '../data/service'

class KeysComponent extends React.Component {
    dataService;
    constructor() {
        super()
        this.state = {
            activeKey: "/",
            keys: {
                id: 'root',
                name: 'Parent',
            },
            isNewKey: false
        }

        this.setActiveKey = this.setActiveKey.bind(this);
        this.fetchKeys = this.fetchKeys.bind(this);
        this.createVirtualDirectory = this.createVirtualDirectory.bind(this);
        this.createVirtualFile = this.createVirtualFile.bind(this);

        this.dataService = new DataService();
    }

    setActiveKey(key) {
        this.setState({
            activeKey: key
        })
    }

    createVirtualFile = async (path) => {
        try {
            let fileTree = await this.dataService.CreateNode(path, false);
            this.setState({
                keys: fileTree,
                activeKey: path,
                isNewKey: true
            });
        } catch (error) {
            //TODO: display an error message
            console.error(error);
        }
    }

    createVirtualDirectory = async (path) => {
        try {
            let fileTree = await this.dataService.CreateNode(path, true);
            this.setState({
                keys: fileTree
            });
        } catch (error) {
            //TODO: display an error message
            console.error(error);
        }
    }

    setupNewKey(path) {
        this.setState({
            activeKey: path,
            isNewKey: true
        })
    }

    deleteKey = async (node) => {
        try {
            let isSuccess = await this.dataService.DeleteNode(node.abspath, node.type === "directory");
            if (isSuccess) {
                this.fetchKeys();
            }
        } catch (error) {
            console.error(error);
        }
    }

    fetchKeys = async () => {
        try {
            let keys = await this.dataService.GetKeys();
            this.setState({ keys: keys });
        } catch (error) {
            // TODO: display an error
            console.error(error);
        }
    }

    componentDidMount() {
        this.fetchKeys();
    }

    render() {
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
                                keys={this.state.keys}
                                onKeyClick={this.setActiveKey}
                                fetchKeys={this.fetchKeys}
                                createFile={this.createVirtualFile}
                                createDirectory={this.createVirtualDirectory}
                                deleteKey={this.deleteKey}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8} lg={9}>
                        <EditorComponent etcdKey={this.state.activeKey} isNewKey={this.state.isNewKey} />
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
}

export default KeysComponent;