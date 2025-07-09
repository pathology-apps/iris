package main

import (
	"encoding/json"
	"fmt"
	"gopkg.in/mail.v2"
	"io/ioutil"
	"log"
	"net/http"
)

type EmailRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Suggestion string `json:"html"`
}

func SendEmail(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Cannot read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var emailReq EmailRequest
	if err := json.Unmarshal(body, &emailReq); err != nil {
		http.Error(w, "Invalid input data", http.StatusBadRequest)
		return
	}

	if err := sendEmail(emailReq); err != nil {
		log.Printf("Failed to send email: %v", err)
		http.Error(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Email sent successfully")
}

func sendEmail(req EmailRequest) error {
	server := "smail-int.med.umich.edu"
	port := 25

	m := mail.NewMessage()
	m.SetHeader("From", "vsb-help@med.umich.edu")
	m.SetHeader("To", "nkathawa@med.umich.edu")
	m.SetHeader("Subject", fmt.Sprintf("[VSB] Suggestion from %s", req.Name))
	m.SetBody("text/html", fmt.Sprintf("%s", req.Suggestion))
	fmt.Println("Suggestion: " + req.Suggestion)

	d := mail.NewDialer(server, port, "", "")

	if err := d.DialAndSend(m); err != nil {
		log.Fatalf("Failed to send email: %v", err)
	} else {
		log.Println("Email sent successfully")
	}
	return nil
}
