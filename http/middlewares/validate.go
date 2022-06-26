package middlewares

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/srimaln91/etcd-adminer/http/request"
)

type requestValidateMiddleware struct{}

var ErrCredentialsNotProvided = errors.New("credentials are not provided")
var ErrEndpointsNotProvided = errors.New("endpoints are not provided")
var ErrAddressNotParseable = errors.New("can not parse ETCD endpoint address")

func NewRequestValidateMiddleware() *requestValidateMiddleware {
	return new(requestValidateMiddleware)
}

func parseEndpoints(header string) ([]string, error) {
	addresses := strings.Split(header, ",")
	
	return addresses, nil
}

func getRequestMeta(r *http.Request) (meta request.RequestMeta, err error) {
	user, pass, ok := r.BasicAuth()
	if !ok {
		return meta, errors.New("credentials are not provided")
	}

	meta.User = user
	meta.Pass = pass

	endpointString := r.Header.Get("X-Endpoints")
	if endpointString == "" {
		return meta, errors.New("endpoints are not provided")
	}

	meta.Endpoints, err = parseEndpoints(endpointString)
	if err != nil {
		return meta, nil
	}

	return meta, err
}

func (rvm *requestValidateMiddleware) ValidateRequest(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		meta, err := getRequestMeta(r)
		if err != nil {
			w.WriteHeader(http.StatusNotAcceptable)
			return
		}

		// Attach request metadata to the Http request. So handlers can take it from the context
		modifiedReq := r.WithContext(context.WithValue(r.Context(), "meta", meta))

		// Call the next handler
		next.ServeHTTP(w, modifiedReq)
	})
}
