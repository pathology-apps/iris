package main

import (
	"encoding/json"
	"net/http"
	"net/url"

	log "github.com/sirupsen/logrus"
)

type authFailureResponse struct {
	ReturnType string `json:"type"`
	Msg        string `json:"msg"`
	Title      string `json:"title"`
}

// BadAuth is a simpler form of HttpErrorfRespoonse() that is solely for our login response.
// This may change in the future so that everyone uses HttpErrorfResponse(), for now this works
// great and provides feedback to the user when logging in about any errors.
func BadAuth(w http.ResponseWriter, resultsErr error) {
	decodedErr, decodedErrErr := url.QueryUnescape(resultsErr.Error())

	if decodedErrErr != nil {
		log.Warnf("BadAuth tried to url.QueryUnescape and failed: %v\n", decodedErrErr.Error())
		w.WriteHeader(http.StatusPreconditionFailed)
		return
	}

	fail := &authFailureResponse{
		ReturnType: "error",
		Msg:        decodedErr,
		Title:      "Login Failed",
	}

	failBytes, failBytesErr := json.Marshal(fail)

	if failBytesErr != nil {
		log.Errorf("BadAuth tried to Marshal a failure message and failed itself: %v\n", failBytesErr)
		w.WriteHeader(http.StatusPreconditionFailed)
		return
	}

	log.Infof("BadAuth: %v", decodedErr)
	w.Write(failBytes)
}
