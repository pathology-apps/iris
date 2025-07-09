package main

import (
	"encoding/json"
	"io"
	"net/http"
)

type intrusionHandler struct{}

func (i intrusionHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	bodyBytes, bodyBytesErr := io.ReadAll(r.Body)

	if bodyBytesErr != nil {
		HttpErrorfResponse(w, "(i intrusionHandler) ServeHTTP tried to read body and failed: %v", bodyBytesErr.Error())
		return
	}

	resp := map[string]interface{}{
		"body":    string(bodyBytes),
		"url":     r.URL.Path,
		"headers": r.Header,
	}

	jsonResp, jsonRespErr := json.Marshal(resp)

	if jsonRespErr != nil {
		HttpErrorfResponse(w, "(i intrusionHandler) tried to json.Marshal(resp) and failed: %v", jsonRespErr.Error())
		return
	}

	w.WriteHeader(http.StatusBadRequest)
	w.Write(jsonResp)
}
