package errors

type GenericError struct {
	Message string `json:"message"`
	Code    string `json:"code"`
}
