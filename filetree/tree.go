package filetree

import (
	"sync/atomic"
)

var counter int64

type Node struct {
	ID       int64            `json:"id"`
	Name     string           `json:"name"`
	Type     string           `json:"type"`
	NodesMap map[string]*Node `json:"-"`
	Nodes    []*Node          `json:"children"`
	AbsPath  string           `json:"abspath"`
}

func NewNode(name string) *Node {
	return &Node{
		ID:       atomic.AddInt64(&counter, 1),
		Name:     name,
		Type:     "directory",
		NodesMap: make(map[string]*Node),
		Nodes:    make([]*Node, 0),
		AbsPath:  "",
	}
}

func (f *Node) NewFolder(name string) *Node {
	folder := NewNode(name)
	f.NodesMap[name] = folder
	f.Nodes = append(f.Nodes, folder)
	return folder
}

func (f *Node) SetupPath(path []string) *Node {
	leafNode := f

	for _, p := range path {
		if _, ok := leafNode.NodesMap[p]; !ok {
			folder := leafNode.NewFolder(p)

			folder.AbsPath = leafNode.AbsPath + "/" + p

			leafNode = folder
			continue
		}
		leafNode = leafNode.NodesMap[p]
	}

	return leafNode
}

func (f *Node) AddFile(path []string, filename string) *Node {
	// Setup the path
	leafNode := f.SetupPath(path)

	file := &Node{
		ID:      atomic.AddInt64(&counter, 1),
		Name:    filename,
		Type:    "file",
		AbsPath: leafNode.AbsPath + "/" + filename,
	}

	leafNode.NodesMap[file.Name] = file
	leafNode.Nodes = append(leafNode.Nodes, file)

	return file
}
