import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function NewDirectoryDialog(props) {

  const [directoryName, setdirectoryName] = React.useState("");
  const [ inputError, setinputError] = React.useState(false);

  const handleChange = (e) => {
    setdirectoryName(e.target.value);
  }

  const submit = (e) => {
    e.preventDefault();
    if (directoryName === "") {
        setinputError(true);
        return
    }

    props.handleSubmit(directoryName);
  }

  return (
    <div>
      <Dialog open={props.open} onClose={props.handleClose}>
        <DialogTitle>New Directory</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the directory name and submit
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleChange}
            error = {inputError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose}>Cancel</Button>
          <Button onClick={submit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
