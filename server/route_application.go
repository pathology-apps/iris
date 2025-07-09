package main

import (
	"github.com/centrifugal/centrifuge"
	"github.com/gorilla/mux"
	"net/http"

	"database/sql"

	"github.com/heptiolabs/healthcheck"
)

type App struct {
	PostgresDB  *sql.DB
	SQLServerDB *sql.DB
	Router      *mux.Router
	Node        *centrifuge.Node
	Secrets     map[string]string
	Health      healthcheck.Handler
}

func RouteApplication(app *App) *mux.Router {
	intrusion := intrusionHandler{}
	spa := spaHandler{staticPath: "../client/build", indexPath: "index.html"}

	api := app.Router.PathPrefix("").Subrouter()
	api.Handle("/study-sets", GetStudySets(app.PostgresDB)).Methods("GET")
	api.Handle("/study-sets/{id}", GetStudySetDetails(app.PostgresDB, app.SQLServerDB)).Methods("GET")
	api.Handle("/study-sets/{id}", SetStudySetDetails(app.PostgresDB, app.SQLServerDB)).Methods("PUT")
	api.Handle("/study-sets/{id}", DeleteStudySet(app.PostgresDB, app.SQLServerDB)).Methods("DELETE")
	api.Handle("/study-set-create", CreateStudySet(app.PostgresDB, app.SQLServerDB)).Methods("POST")

	api.Handle("/collections", GetCollections(app.PostgresDB, app.SQLServerDB)).Methods("GET")
	api.Handle("/collections/{collectionName}", GetCollectionItems(app.SQLServerDB)).Methods("GET")
	api.Handle("/collections/updatecollection/{collectionName}", UpdateCollection(app.PostgresDB)).Methods("PUT")
	api.Handle("/collections/addcollection", AddCollection(app.PostgresDB)).Methods("POST")
	api.Handle("/collections/deletecollection/{collectionName}", DeleteCollection(app.PostgresDB)).Methods("DELETE")

	api.Handle("/users", GetUsers(app.PostgresDB)).Methods("GET")
	api.Handle("/users/{userID}", UpdateUser(app.PostgresDB)).Methods("PUT")
	api.Handle("/users/{userID}", DeleteUser(app.PostgresDB)).Methods("DELETE")
	api.Handle("/users/adduser", AddUser(app.PostgresDB)).Methods("POST")
	api.Handle("/users/permissions/{username}", GetUserPermissions(app.PostgresDB)).Methods("GET")

	api.Handle("/ldap/users", http.HandlerFunc(GetLDAPUsers)).Methods("GET")

	api.Handle("/collections/randomset/{collectionName}", GetRandomCollectionItems(app.SQLServerDB)).Methods("GET")

	api.Handle("/sendemail", http.HandlerFunc(SendEmail)).Methods("POST")

	api.Handle("/login", LoginHandler(app)).Methods("POST")

	api.PathPrefix("/").Handler(intrusion)

	app.Router.Handle("/connection/websocket", centrifuge.NewWebsocketHandler(app.Node, centrifuge.WebsocketConfig{
		ReadBufferSize:     1024,
		UseWriteBufferPool: true,
		CheckOrigin: func(h *http.Request) bool {
			return true
		},
	}))

	app.Router.PathPrefix("/").Handler(spa)
	return app.Router
}
