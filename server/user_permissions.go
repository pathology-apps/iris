package main

import (
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/go-ldap/ldap/v3"
	"io/ioutil"
	"net/http"
	"strings"
)

type User struct {
	ID          string   `json:"id"`
	Username    string   `json:"username"`
	Permissions []string `json:"permissions"`
}

func GetUsers(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /api/users")

		rows, err := db.Query("SELECT u.id, u.uniqname, p.permission_name FROM users u JOIN user_permissions up ON u.id = up.user_id JOIN permissions p ON up.permission_id = p.id")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		userMap := make(map[string]*User)
		for rows.Next() {
			var id, username, permission string
			if err := rows.Scan(&id, &username, &permission); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if _, exists := userMap[id]; !exists {
				userMap[id] = &User{ID: id, Username: username, Permissions: []string{}}
			}
			userMap[id].Permissions = append(userMap[id].Permissions, permission)
		}

		var users []User
		for _, user := range userMap {
			users = append(users, *user)
		}

		json.NewEncoder(w).Encode(users)
	}
}

func GetUserPermissions(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /api/users/permissions/")
		username := strings.TrimPrefix(r.URL.Path, "/users/permissions/")

		var permissions []string

		// Get user ID from username
		var userID string
		err := db.QueryRow("SELECT id FROM users WHERE uniqname = $1", username).Scan(&userID)
		if err != nil {
			if err == sql.ErrNoRows {
				fmt.Printf("User %s not found\n", username)
			} else {
				fmt.Printf("Failed to fetch user ID for %s: %v\n", username, err)
			}
			// Respond with an empty permissions list
			writeEmptyPermissions(w, permissions)
			return
		}
		fmt.Printf("User ID for %s: %s\n", username, userID)

		// Query to get permissions for the user
		query := `
			SELECT p.permission_name
			FROM user_permissions up
			JOIN permissions p ON up.permission_id = p.id
			WHERE up.user_id = $1
		`

		rows, err := db.Query(query, userID)
		if err != nil {
			fmt.Printf("Failed to fetch permissions for user ID %s: %v\n", userID, err)
			writeEmptyPermissions(w, permissions)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var permission string
			if err := rows.Scan(&permission); err != nil {
				fmt.Printf("Failed to scan permission for user ID %s: %v\n", userID, err)
				writeEmptyPermissions(w, permissions)
				return
			}
			permissions = append(permissions, permission)
		}

		// Check for any row errors
		if err = rows.Err(); err != nil {
			fmt.Printf("Error reading permissions for user ID %s: %v\n", userID, err)
			writeEmptyPermissions(w, permissions)
			return
		}

		writeEmptyPermissions(w, permissions)
	}
}

func writeEmptyPermissions(w http.ResponseWriter, permissions []string) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(permissions); err != nil {
		http.Error(w, "Failed to encode permissions", http.StatusInternalServerError)
	}
}

func AddUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /api/users/adduser (POST)")

		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Cannot read request body", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		var user User
		if err := json.Unmarshal(body, &user); err != nil {
			http.Error(w, "Invalid input data", http.StatusBadRequest)
			return
		}

		// Here we'll use LDAP to check if the user exists
		exists, err := checkUserInLDAP(user.Username)
		if err != nil {
			http.Error(w, "Failed to connect to LDAP", http.StatusInternalServerError)
			return
		}

		if !exists {
			http.Error(w, "User not found in LDAP", http.StatusBadRequest)
			return
		}

		query := `INSERT INTO users (uniqname) VALUES ($1) RETURNING id`
		var userId string
		if err := db.QueryRow(query, user.Username).Scan(&userId); err != nil {
			http.Error(w, "Failed to add user", http.StatusInternalServerError)
			return
		}

		for _, perm := range user.Permissions {
			stmt := `INSERT INTO user_permissions (user_id, permission_id) 
                     SELECT $1, id FROM permissions WHERE permission_name = $2`
			if _, err := db.Exec(stmt, userId, perm); err != nil {
				http.Error(w, "Failed to set user permissions", http.StatusInternalServerError)
				return
			}
		}

		// Query back permissions for the new user
		rows, err := db.Query(`SELECT p.permission_name 
                               FROM user_permissions up
                               JOIN permissions p ON up.permission_id = p.id
                               WHERE up.user_id = $1`, userId)

		if err != nil {
			http.Error(w, "Failed to retrieve permissions", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var permissions []string
		for rows.Next() {
			var permission string
			if err := rows.Scan(&permission); err != nil {
				http.Error(w, "Failed to scan permission", http.StatusInternalServerError)
				return
			}
			permissions = append(permissions, permission)
		}

		newUser := User{
			ID:          userId,
			Username:    user.Username,
			Permissions: permissions,
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(newUser); err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	}
}

func checkUserInLDAP(username string) (bool, error) {
	ldapServer := "ldap.ent.med.umich.edu"
	ldapPort := 636
	baseDN := "dc=med,dc=umich,dc=edu"

	tlsConfig := &tls.Config{ServerName: ldapServer, InsecureSkipVerify: false}

	conn, err := ldap.DialTLS("tcp", fmt.Sprintf("%s:%d", ldapServer, ldapPort), tlsConfig)
	if err != nil {
		return false, err
	}
	defer conn.Close()

	bindDN := "cn=path-web-auth-pub,ou=people," + baseDN
	if err := conn.Bind(bindDN, "wh74dw"); err != nil {
		return false, err
	}

	searchRequest := ldap.NewSearchRequest(
		baseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf("(uid=%s)", ldap.EscapeFilter(username)),
		[]string{"dn"},
		nil,
	)

	sr, err := conn.Search(searchRequest)
	if err != nil {
		return false, err
	}

	if len(sr.Entries) != 1 {
		return false, nil
	}

	return true, nil
}

func GetLDAPUsers(w http.ResponseWriter, r *http.Request) {
	searchParam := r.URL.Query().Get("search") // Get the search parameter from the request

	if searchParam == "" {
		http.Error(w, "Missing search parameter", http.StatusBadRequest)
		return
	}

	ldapServer := "ldap.ent.med.umich.edu"
	ldapPort := 636
	baseDN := "dc=med,dc=umich,dc=edu"

	tlsConfig := &tls.Config{ServerName: ldapServer, InsecureSkipVerify: false}

	conn, err := ldap.DialTLS("tcp", fmt.Sprintf("%s:%d", ldapServer, ldapPort), tlsConfig)
	if err != nil {
		http.Error(w, "Failed to connect to LDAP", http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	bindDN := "cn=path-web-auth-pub,ou=people," + baseDN
	if err := conn.Bind(bindDN, "wh74dw"); err != nil {
		http.Error(w, "Failed to bind to LDAP", http.StatusInternalServerError)
		return
	}

	searchRequest := ldap.NewSearchRequest(
		baseDN,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf("(&(uid=%s*))", ldap.EscapeFilter(searchParam)), // Search users matching the searchParam
		[]string{"uid"}, // Retrieve the 'uid' attribute
		nil,
	)

	sr, err := conn.Search(searchRequest)
	if err != nil {
		http.Error(w, "Failed to execute LDAP search", http.StatusInternalServerError)
		return
	}

	var users []string
	for _, entry := range sr.Entries {
		users = append(users, entry.GetAttributeValue("uid"))
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(users); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func UpdateUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.Method, r.URL.Path)
		username := strings.TrimPrefix(r.URL.Path, "/users/")
		fmt.Println("Received request for /api/users/", username)
		fmt.Printf("Received request for /api/users/%s (PUT)\n", username)

		if r.Method != http.MethodPut {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Cannot read request body", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		var user User
		if err := json.Unmarshal(body, &user); err != nil {
			http.Error(w, "Invalid input data", http.StatusBadRequest)
			return
		}
		fmt.Printf("Updating user: %s with permissions: %v\n", user.Username, user.Permissions)

		// query := `UPDATE users SET uniqname = $1 WHERE id = $2`
		// if _, err := db.Exec(query, user.Username, username); err != nil {
		// 	http.Error(w, "Failed to update user", http.StatusInternalServerError)
		// 	return
		// }

		// First, remove existing permissions
		deletePermsQuery := `DELETE FROM user_permissions WHERE user_id = $1`
		if _, err := db.Exec(deletePermsQuery, username); err != nil {
			http.Error(w, "Failed to update user permissions", http.StatusInternalServerError)
			return
		}

		// Then, add new permissions
		for _, perm := range user.Permissions {
			stmt := `INSERT INTO user_permissions (user_id, permission_id) SELECT $1, id FROM permissions WHERE permission_name = $2`
			if _, err := db.Exec(stmt, username, perm); err != nil {
				http.Error(w, "Failed to set user permissions", http.StatusInternalServerError)
				return
			}
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "User updated successfully")
	}
}

func DeleteUser(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username := strings.TrimPrefix(r.URL.Path, "/users/")
		fmt.Printf("Received request for /api/users/%s (DELETE)\n", username)

		if r.Method != http.MethodDelete {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		stmt := `DELETE FROM users WHERE id = $1`
		if _, err := db.Exec(stmt, username); err != nil {
			http.Error(w, "Failed to delete user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "User deleted successfully")
	}
}
