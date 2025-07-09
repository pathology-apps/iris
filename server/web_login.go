package main

import (
	"crypto/rand"
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-ldap/ldap/v3"
	log "github.com/sirupsen/logrus"
)

type WebLoginResponse struct {
	Success  bool   `json:"success"`
	FullName string `json:"full_name,omitempty"`
}

func generateSecureRandomToken() (string, error) {
	length := 32
	token := make([]byte, length)
	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(token), nil
}

func WebLogin(app *App, ipAddress string, username string, password string) (*WebLoginResponse, error) {
	wl := &WebLoginResponse{}

	ldapServer := "ldap.ent.med.umich.edu"
	ldapPort := 636
	baseDN := "dc=med,dc=umich,dc=edu"

	tlsConfig := &tls.Config{ServerName: ldapServer, InsecureSkipVerify: false}

	conn, err := ldap.DialTLS("tcp", fmt.Sprintf("%s:%d", ldapServer, ldapPort), tlsConfig)
	if err != nil {
		log.Errorf("Failed to connect to LDAP server: %+v", err)
		return nil, err
	}
	defer conn.Close()

	bindDN := "cn=path-web-auth-pub,ou=people," + baseDN
	if err := conn.Bind(bindDN, "wh74dw"); err != nil {
		log.Errorf("Failed to bind with read-only account: %+v", err)
		return nil, err
	}

	// Perform a search to get user DN and Full Name
	searchRequest := ldap.NewSearchRequest(
		baseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf("(uid=%s)", ldap.EscapeFilter(username)),
		[]string{"dn", "fullname"}, // Make sure to request `cn` or `displayName` for full name
		nil,
	)

	sr, err := conn.Search(searchRequest)
	if err != nil {
		log.Errorf("Failed to search for user: %+v", err)
		return nil, err
	}

	if len(sr.Entries) != 1 {
		log.Error("User does not exist or too many entries returned")
		return nil, fmt.Errorf("user does not exist or too many entries returned")
	}

	userDN := sr.Entries[0].DN
	fullName := sr.Entries[0].GetAttributeValue("fullname") // Or "displayName", according to your LDAP schema
	fmt.Println("Full Name:", fullName)

	if err := conn.Bind(userDN, password); err != nil {
		if getenv("ENV", "") == "local" {
			log.Infof("Bypassing LDAP authentication in local environment")
			wl.Success = true
			wl.FullName = fullName
			return wl, nil
		}
		log.Errorf("Failed to bind as user: %+v", err)
		return nil, err
	}

	wl.Success = true
	wl.FullName = fullName
	return wl, nil
}

func LoginHandler(app *App) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req map[string]string
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		ipAddress := r.RemoteAddr
		username := req["username"]
		password := req["password"]

		response, err := WebLogin(app, ipAddress, username, password)
		if err != nil || !response.Success {
			fmt.Println("Login failed")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		token, err := generateSecureRandomToken()
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session_token",
			Value:    token,
			Expires:  time.Now().Add(24 * time.Hour),
			HttpOnly: false, // can be false when debugging
			Secure:   false, // set to true in production
			Path:     "/",
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"redirect": "/", "username": username, "full_name": response.FullName})
	}
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil || cookie.Value != "some-session-token" {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}
		next.ServeHTTP(w, r)
	})
}
