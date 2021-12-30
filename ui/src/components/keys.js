import * as React from 'react';

import FSNavigator from './tree';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import EditorComponent from './editor';
import axios from 'axios';

class KeysComponent extends React.Component {

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
    }

    setActiveKey(key) {
        this.setState({
            activeKey: key
        })
    }

    createVirtualFile(path) {
        axios.post(`/api/directory`, {
            path: path,
            isDirectory: false
        }, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            const keys = res.data;
            console.log(keys);
            this.setState({ keys: keys });

            this.setState({
                activeKey: path,
                isNewKey: true
            })
        })
    }

    createVirtualDirectory(path) {
        axios.post(`/api/directory`, {
            path: path,
            isDirectory: true
        }, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            const keys = res.data;
            console.log(keys);
            this.setState({ keys: keys });
        })
    }

    setupNewKey(path){
        this.setState({
            activeKey: path,
            isNewKey: true
        })
    }

    deleteKey(node) {
        axios.delete(`/api/keys`, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            },
            data: {
                key: node.abspath,
                isDirectory: node.type === "directory"
            }
        }).then(res => {
            const data = res.data;
            console.log(data);
            this.fetchKeys();
        })
    }

    fetchKeys() {
        axios.get(`/api/keys`, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            const keys = res.data;
            console.log(keys);
            this.setState({ keys: keys });
        })
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