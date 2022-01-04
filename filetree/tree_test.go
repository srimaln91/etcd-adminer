package filetree

import (
	"testing"
)

func TestNewTree(t *testing.T) {
	f := NewFileTree("/")
	if f == nil {
		t.Error("invalid result")
	}
}

func TestCreatePath(t *testing.T) {
	f := NewFileTree("/")
	if f == nil {
		t.Error("invalid result")
		return
	}

	path := []string{"system", "app1", "db"}
	leaf := f.SetupPath(f.Root, path)
	if leaf.Name != "db" {
		t.Error("incorret output")
	}
}

func TestAddFile(t *testing.T) {
	f := NewFileTree("/")
	if f == nil {
		t.Error("invalid result")
		return
	}

	path := []string{"system", "app1", "db"}
	filename := "testfile"
	// fileContent := []byte("test byte array")

	f.AddFile(f.Root, path, filename)
	// if !bytes.Equal(fileContent, file.Content.([]byte)) {
	// 	t.Error("incorrect result")
	// }
}
