package main

import (
	"log"
	"os"
	"path/filepath"
)

func getenv(key, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return value
}

func getSecrets(keys []string) map[string]string {
	secretsDir := getenv("SECRETS_DIR", "/run/secrets")
	secrets := make(map[string]string)

	for _, key := range keys {
		valueFilePath := filepath.Join(secretsDir, key)
		value, err := os.ReadFile(valueFilePath)
		if err != nil {
			log.Fatalf("Error reading secret file %s: %v\n", valueFilePath, err)
		}

		secrets[key] = string(value)
	}

	return secrets
}

func getSqlServerSecrets() map[string]string {
	keys := []string{"SQLSERVER_USER", "SQLSERVER_PASS", "SQLSERVER_HOST", "SQLSERVER_PORT", "SQLSERVER_DB"}
	return getSecrets(keys)
}

func getPostgresSecrets() map[string]string {
	keys := []string{"POSTGRES_USER", "POSTGRES_PASS", "POSTGRES_HOST", "POSTGRES_PORT", "POSTGRES_DB"}
	return getSecrets(keys)
}
