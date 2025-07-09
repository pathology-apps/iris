package main

import (
	"database/sql"
	"fmt"
	_ "github.com/denisenkom/go-mssqldb"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

func SetupApp() *App {
	app := &App{}

	app.Router = mux.NewRouter()

	postgresSecrets := getPostgresSecrets()
	postgresUser := postgresSecrets["POSTGRES_USER"]
	postgresPassword := postgresSecrets["POSTGRES_PASS"]
	postgresHost := postgresSecrets["POSTGRES_HOST"]
	postgresPort := postgresSecrets["POSTGRES_PORT"]
	postgresDb := postgresSecrets["POSTGRES_DB"]

	postgresDSN := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		postgresUser, postgresPassword, postgresHost, postgresPort, postgresDb)

	var err error
	app.PostgresDB, err = sql.Open("postgres", postgresDSN)
	if err != nil {
		log.Fatalf("Error opening PostgreSQL database: %v\n", err)
	}

	sqlServerSecrets := getSqlServerSecrets()
	sqlserver_user := sqlServerSecrets["SQLSERVER_USER"]
	sqlserver_password := sqlServerSecrets["SQLSERVER_PASS"]
	sqlserver_host := sqlServerSecrets["SQLSERVER_HOST"]
	sqlserver_port := sqlServerSecrets["SQLSERVER_PORT"]
	sqlserver_db := sqlServerSecrets["SQLSERVER_DB"]

	sqlServerDSN := fmt.Sprintf("sqlserver://%s:%s@%s:%s?database=%s",
		sqlserver_user, sqlserver_password, sqlserver_host, sqlserver_port, sqlserver_db)

	app.SQLServerDB, err = sql.Open("sqlserver", sqlServerDSN)
	if err != nil {
		log.Fatalf("Error opening SQL Server database: %v\n", err)
	}

	RouteApplication(app)

	return app
}

func main() {
	app := SetupApp()
	defer app.PostgresDB.Close()
	defer app.SQLServerDB.Close()
	port := "3000"
	fmt.Printf("Starting server at port %s\n", port)
	if err := http.ListenAndServe(":"+port, app.Router); err != nil {
		log.Fatalf("Error starting server: %v\n", err)
	}
}
