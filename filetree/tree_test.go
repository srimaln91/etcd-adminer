package filetree

import (
	"testing"
)

func TestNewTree(t *testing.T) {
	f := NewNode("/")
	if f == nil {
		t.Error("invalid result")
	}
}

func TestCreatePath(t *testing.T) {
	f := NewNode("/")
	if f == nil {
		t.Error("invalid result")
	}

	path := []string{"system", "app1", "db"}
	leaf := f.SetupPath(path)
	if leaf.Name != "db" {
		t.Error("incorret output")
	}
}

func TestAddFile(t *testing.T) {
	f := NewNode("/")
	if f == nil {
		t.Error("invalid result")
	}

	path := []string{"system", "app1", "db"}
	filename := "testfile"
	// fileContent := []byte("test byte array")

	f.AddFile(path, filename)
	// if !bytes.Equal(fileContent, file.Content.([]byte)) {
	// 	t.Error("incorrect result")
	// }
}
