import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';

export default function FSNavigator(props) {

  // const [selected, setSelected] = React.useState([]);

  const handler = (event) => {
    event.preventDefault();
    let key = event.target.parentElement.parentElement.getAttribute("data-index");
    let type = event.target.parentElement.parentElement.getAttribute("type");
    if (type === "file") {
      console.log(key);
      props.onKeyClick(key);
    }
  };

  const renderTree = (nodes) => (
    <TreeItem key={nodes.abspath} nodeId={nodes.id.toString()} label={nodes.name} type={nodes.type} data-index={nodes.abspath} onClick={handler}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <TreeView
      aria-label="rich object"
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={['root']}
      defaultExpandIcon={<ChevronRightIcon />}
      // onNodeSelect={handleSelect}
      sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    >
      {renderTree(props.keys)}
    </TreeView>
  );
}