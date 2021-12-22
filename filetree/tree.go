package filetree

type File struct {
	Name    string      `json:"name"`
	Content interface{} `json:"content"`
}

type Folder struct {
	Name    string             `json:"name"`
	Folders map[string]*Folder `json:"folders"`
	Files   []*File            `json:"files"`
}

func NewFolder(name string) *Folder {
	return &Folder{
		Name:    name,
		Folders: make(map[string]*Folder),
		Files:   make([]*File, 0),
	}
}

func (f *Folder) NewFolder(name string) *Folder {
	folder := NewFolder(name)
	f.Folders[name] = folder
	return folder
}

func (f *Folder) SetupPath(path []string) *Folder {
	leafNode := f
	for _, p := range path {
		if _, ok := leafNode.Folders[p]; !ok {
			folder := leafNode.NewFolder(p)
			leafNode = folder
			continue
		}
		leafNode = leafNode.Folders[p]
	}

	return leafNode
}

func (f *Folder) AddFile(path []string, filename string, content interface{}) *File {
	// Setup the path
	leafNode := f.SetupPath(path)

	file := &File{
		Name:    filename,
		Content: content,
	}

	leafNode.Files = append(leafNode.Files, file)
	return file
}
