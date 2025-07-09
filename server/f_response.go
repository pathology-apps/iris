package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	log "github.com/sirupsen/logrus"
)

type Object struct {
	Error   bool   `json:"error"`
	Message string `json:"message"`
}

func HttpResponse(w http.ResponseWriter, format string, logs ...interface{}) {
	msg := fmt.Sprintf(format, logs[:]...)

	badResp := &Object{
		Error:   true,
		Message: msg,
	}

	jsonResp, jsonRespErr := json.Marshal(badResp)

	if jsonRespErr != nil {
		log.Errorf("HttpErrorfResponse failed to Marshal json: %v", jsonRespErr.Error())
		w.WriteHeader(http.StatusExpectationFailed)
		return
	}

	w.WriteHeader(http.StatusPreconditionFailed)
	w.Write(jsonResp)
}

func HttpInfofResponse(w http.ResponseWriter, format string, logs ...interface{}) {
	log.Infof(format, logs[:]...)

	HttpResponse(w, format, logs[:]...)
}

func HttpWarnfResponse(w http.ResponseWriter, format string, logs ...interface{}) {
	log.Warnf(format, logs[:]...)

	HttpResponse(w, format, logs[:]...)
}

func HttpErrorfResponse(w http.ResponseWriter, format string, logs ...interface{}) {
	log.Errorf(format, logs[:]...)

	HttpResponse(w, format, logs[:]...)
}
