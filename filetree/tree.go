package filetree

type Node struct {
	ID       int64            `json:"id"`
	Name     string           `json:"name"`
	Type     string           `json:"type"`
	NodesMap map[string]*Node `json:"-"`
	Nodes    []*Node          `json:"children"`
	AbsPath  string           `json:"abspath"`
}

type FileTree struct {
	Root      *Node
	NodeCount int64
}

func NewFileTree(basename string) *FileTree {
	return &FileTree{
		Root:      NewNode(basename, 1),
		NodeCount: 1,
	}
}

func NewNode(name string, ID int64) *Node {
	return &Node{
		ID:       ID,
		Name:     name,
		Type:     "directory",
		NodesMap: make(map[string]*Node),
		Nodes:    make([]*Node, 0),
		AbsPath:  "",
	}
}

func (f *Node) NewFolder(name string, ID int64) *Node {
	folder := NewNode(name, ID)
	f.NodesMap[name] = folder
	f.Nodes = append(f.Nodes, folder)
	return folder
}

func (ft *FileTree) SetupPath(baseNode *Node, path []string) *Node {
	leafNode := baseNode

	for _, p := range path {
		if _, ok := leafNode.NodesMap[p]; !ok {
			ft.NodeCount++
			folder := leafNode.NewFolder(p, ft.NodeCount)

			folder.AbsPath = leafNode.AbsPath + "/" + p

			leafNode = folder
			continue
		}
		leafNode = leafNode.NodesMap[p]
	}

	return leafNode
}

func (ft *FileTree) AddFile(baseNode *Node, path []string, filename string) *Node {
	// Setup the path
	leafNode := ft.SetupPath(baseNode, path)

	ft.NodeCount++
	file := &Node{
		ID:      ft.NodeCount,
		Name:    filename,
		Type:    "file",
		AbsPath: leafNode.AbsPath + "/" + filename,
	}

	leafNode.NodesMap[file.Name] = file
	leafNode.Nodes = append(leafNode.Nodes, file)

	return file
}

func (ft *FileTree) AddDirectory(baseNode *Node, path []string) *Node {
	// Setup the path
	leafNode := ft.SetupPath(baseNode, path)
	return leafNode
}
