package filetree

type Node struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`

	// Type is the string representation of the node type. To be removed in the future and replaced by NodeType
	Type string `json:"type"`

	// Typev2 represents the node type as a package defined constant in a backward compatible way
	Typev2 NodeType `json:"nodeType"`

	Nodes      []*Node    `json:"children"`
	AbsPath    string     `json:"abspath"`
	Permission Permission `json:"permission"`
	IsVirtual  bool       `json:"isVirtual"`
}

type NodeType byte

const (
	NODE_TYPE_DIRECTORY NodeType = 0
	NODE_TYPE_FILE      NodeType = 1
)

type Permission byte

const (
	PERMISSON_READ Permission = 1 << iota
	PERMISSION_WRITE
)

type FileTree struct {
	Root      *Node
	NodeCount int64
}

func NewFileTree(basename string) *FileTree {
	return &FileTree{
		Root:      NewNode(basename, 1, false),
		NodeCount: 1,
	}
}

func NewNode(name string, ID int64, isVirtual bool) *Node {
	return &Node{
		ID:      ID,
		Name:    name,
		Type:    "directory",
		Typev2:  NODE_TYPE_DIRECTORY,
		Nodes:   make([]*Node, 0),
		AbsPath: "",
		IsVirtual: isVirtual,
	}
}

func (f *Node) NewFolder(name string, ID int64, isVirtual bool) *Node {
	folder := NewNode(name, ID, isVirtual)
	f.Nodes = append(f.Nodes, folder)
	return folder
}

func (ft *FileTree) SetupPath(baseNode *Node, path []string, isVirtual bool) *Node {
	leafNode := baseNode

	for _, p := range path {
		var nodeExist bool
		for _, node := range leafNode.Nodes {
			if node.Name == p && node.Type == "directory" {
				nodeExist = true
				leafNode = node
				continue
			}
		}

		if !nodeExist {
			ft.NodeCount++
			folder := leafNode.NewFolder(p, ft.NodeCount, isVirtual)

			folder.AbsPath = leafNode.AbsPath + "/" + p

			leafNode = folder
			continue
		}
	}

	return leafNode
}

func (ft *FileTree) AddFile(baseNode *Node, path []string, filename string, isVirtual bool) *Node {
	// Setup the path
	leafNode := ft.SetupPath(baseNode, path, isVirtual)

	// Do not create the node if it exists in the tree
	for _, f := range leafNode.Nodes {
		if f.Name == filename && f.Type == "file" {
			return f
		}
	}

	// Create a new node
	ft.NodeCount++
	file := &Node{
		ID:      ft.NodeCount,
		Name:    filename,
		Type:    "file",
		Typev2:  NODE_TYPE_FILE,
		AbsPath: leafNode.AbsPath + "/" + filename,
	}

	leafNode.Nodes = append(leafNode.Nodes, file)

	return file
}

func (ft *FileTree) AddDirectory(baseNode *Node, path []string, isVirtual bool) *Node {
	// Setup the path
	leafNode := ft.SetupPath(baseNode, path, isVirtual)
	return leafNode
}
