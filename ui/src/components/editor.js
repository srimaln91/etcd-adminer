import * as React from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Editor from "@monaco-editor/react";
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import DataService from '../data/service'

class EditorComponent extends React.Component {
    dataService;

    constructor(props) {
        super(props);
        console.log(this.props);
        this.state = {
            key: "",
            value: '// Please select a key',
            remoteKey: {},
            snackBarSuccess: false,
            snackBarError: false
        }

        this.onChange = this.onChange.bind(this);
        this.discard = this.discard.bind(this);
        this.save = this.save.bind(this);

        this.dataService = new DataService();
    }

    static getDerivedStateFromProps(props, state) {
        if (props.etcdKey !== state.key) {
            return {
                key: props.etcdKey,
            };
        }

        // Return null if the state hasn't changed
        return null;
    }

    fetchKey = async (key) => {

        this.setState({
            value: "fetching...",
            remoteKey: {
                createRevision: "N/A",
                modRevision: "N/A",
                version: "N/A",
                lease: 0
            }
        });

        try {
            let data = await this.dataService.FetchKey(key);
            this.setState({
                key: data.key,
                value: data.value,
                remoteKey: data
            });
        } catch (error) {
            console.error(error);
            this.setState({ snackBarError: true });
        }
    }

    discard = () => {
        this.fetchKey(this.props.etcdKey)
    }

    save = async () => {
        try {
            let result = await this.dataService.PutKey(this.state.key, this.state.value);
            if (result) {
                this.setState({ snackBarSuccess: true });
                this.fetchKey(this.props.etcdKey)
            }
        } catch (error) {
            console.log(error);
            this.setState({ snackBarError: true });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isNewKey !== this.props.isNewKey && this.props.isNewKey) {
            this.setState({
                value: "Type your content here and click on save",
                remoteKey: {
                    createRevision: "N/A",
                    modRevision: "N/A",
                    version: "N/A",
                    lease: 0
                }
            });

            return;
        }

        if (this.props.etcdKey !== prevProps.etcdKey) {
            this.fetchKey(this.props.etcdKey);
        }
    }

    onChange(newValue, e) {
        this.setState({
            value: newValue
        })
    }


    handleSnackBarClose = (event, reason) => {
        this.setState({ snackBarSuccess: false });
    };

    render() {
        const code = this.state.value;
        const options = {
            selectOnLineNumbers: true
        };

        const Item = styled(Paper)(({ theme }) => ({
            ...theme.typography.body2,
            padding: theme.spacing(1),
            textAlign: 'center',
            color: theme.palette.text.secondary,
        }));

        const Alert = React.forwardRef(function Alert(props, ref) {
            return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
        });

        return (
            <React.Fragment>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 800,
                    }}
                >
                    <Paper sx={{ marginBottom: 1, padding: 2 }}>
                        <Stack direction="row" spacing={2}>
                            <Item>Key: {this.state.key}</Item>
                            <Item>Create Revision: {this.state.remoteKey.createRevision} </Item>
                            <Item>Mod Revision: {this.state.remoteKey.modRevision}</Item>
                            <Item>Version: {this.state.remoteKey.version}</Item>
                            <Item>Lease: {this.state.remoteKey.lease === 0 ? "None" : this.state.remoteKey.lease}</Item>
                        </Stack>
                    </Paper>
                    <div>

                        <Editor
                            width="100%"
                            height="650px"
                            defaultLanguage="yaml"
                            theme="vs-dark"
                            value={code}
                            options={options}
                            onChange={this.onChange}
                            editorDidMount={this.editorDidMount}
                        />

                        <div style={{ float: "right", paddingTop: "10px" }}>
                            <Button variant="contained" color="success" style={{ marginRight: "10px" }} onClick={this.save}>
                                Save
                            </Button>
                            <Button variant="contained" color="error" onClick={this.discard}>
                                Discard
                            </Button>
                        </div>
                    </div>
                </Paper>
                <Snackbar open={this.state.snackBarSuccess} autoHideDuration={6000} onClose={this.handleSnackBarClose}>
                    <Alert severity="success" sx={{ width: '100%' }} onClose={this.handleSnackBarClose}>
                        Successfully updated the key!
                    </Alert>
                </Snackbar>
                <Snackbar open={this.state.snackBarError} autoHideDuration={6000} onClose={this.handleSnackBarClose}>
                    <Alert severity="error" sx={{ width: '100%' }} onClose={this.handleSnackBarClose}>
                        Something went wrong!
                    </Alert>
                </Snackbar>
            </React.Fragment>
        )
    }
}

export default EditorComponent;