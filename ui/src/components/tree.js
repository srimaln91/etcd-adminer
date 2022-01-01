import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import FolderIcon from '@mui/icons-material/Folder';
import TreeItem from '@mui/lab/TreeItem';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationDialog from './dialogs/confirmationDialog';
import NewDirectoryDialog from './dialogs/newDirectoryDialog'
import NewFileDialog from './dialogs/newFileDialog';

export default function FSNavigator(props) {

  const [contextMenu, setContextMenu] = React.useState(null);
  const [deleteConfirmationDialogOpen, setdeleteConfirmationDialogOpen] = React.useState(false);
  const [contextMenuSelectedNode, setContextMenuSelectedNode] = React.useState(null);
  const [newDirectoryDialogOpen, setnewDirectoryDialogOpen] = React.useState(false);
  const [newFileDialogOpen, setnewFileDialogOpen] = React.useState(false);

  const handleContextMenu = (event, node) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX - 2,
          mouseY: event.clientY - 4,
        }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
        // Other native context menus might behave different.
        // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
        null,
    );

    setContextMenuSelectedNode(node);
    console.log(node);
  };

  const handleClose = (e) => {
    setContextMenu(null);
    // console.log(e.target);
    switch (e.target.parentElement.parentElement.getAttribute("data-id")) {
      case "refresh":
        props.fetchKeys();
        break;
      case "newfile":
        setnewFileDialogOpen(true);
        break;
      case "delete":
        setdeleteConfirmationDialogOpen(true);
        break;
      case "newdir":
        setnewDirectoryDialogOpen(true);
        break;
      default:
        console.log("no menu action defined");
    }
  };

  const handler = (event) => {
    event.preventDefault();
    let key = event.target.parentElement.parentElement.getAttribute("data-index");
    let type = event.target.parentElement.parentElement.getAttribute("type");
    if (type === "file") {
      props.onKeyClick(key);
    }
  };

  const renderTree = (nodes) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id.toString()}
      label={nodes.name}
      type={nodes.type}
      data-index={nodes.abspath}
      onClick={handler}
      onContextMenu={event => handleContextMenu(event, nodes)}
    >
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  const onConfirmationDialogCancel = () => {
    setdeleteConfirmationDialogOpen(false)
  }

  const onConfirmationDialogConfirm = () => {
    setdeleteConfirmationDialogOpen(false);
    props.deleteKey(contextMenuSelectedNode);
  }

  const getDeleteDialogContent = () => {
    if (contextMenuSelectedNode === null) {
      return ""
    }
    return "Do you really want to delete key " + contextMenuSelectedNode.abspath + " ?"
  }

  const newDirectoryDialogSubmit = (name) => {
    setnewDirectoryDialogOpen(false);
    props.createDirectory(contextMenuSelectedNode.abspath + "/" + name);
  }

  const newDirectoryDialogClose = () => {
    setnewDirectoryDialogOpen(false);
  }

  const newFileDialogSubmit = (name) => {
    setnewFileDialogOpen(false);
    props.createFile(contextMenuSelectedNode.abspath + "/" + name);
  }

  const newFileDialogClose = () => {
    setnewFileDialogOpen(false);
  }

  return (
    <div>
      <TreeView
        aria-label="rich object"
        defaultCollapseIcon={<FolderOpenIcon sx={{ color: "#f1c40f" }} />}
        defaultExpanded={['1']}
        defaultEndIcon={<InsertDriveFileIcon sx={{ color: "#f1c40f" }} />}
        defaultExpandIcon={<FolderIcon sx={{ color: "#f1c40f" }} />}
        sx={{ height: 700, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      >
        {renderTree(props.keys)}
      </TreeView>
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleClose} data-id="newfile"
          disabled={ contextMenuSelectedNode !== null && contextMenuSelectedNode.type === "file"}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New File</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose} data-id="newdir"
          disabled={ contextMenuSelectedNode !== null && contextMenuSelectedNode.type === "file"}
        >
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Directory</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose} data-id="delete">
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose} data-id="refresh">
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={deleteConfirmationDialogOpen}
        onCancel={onConfirmationDialogCancel}
        onConfirm={onConfirmationDialogConfirm}
        title={"Delete Key?"}
        content={getDeleteDialogContent()}
      />

      <NewDirectoryDialog
        open={newDirectoryDialogOpen}
        handleSubmit={newDirectoryDialogSubmit}
        handleClose={newDirectoryDialogClose}
      />

      <NewFileDialog
        open={newFileDialogOpen}
        handleSubmit={newFileDialogSubmit}
        handleClose={newFileDialogClose}
      />
    </div>
  );
}