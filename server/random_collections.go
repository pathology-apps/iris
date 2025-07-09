package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
)

func GetRandomCollectionItems(sqlServerDB *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /collections/randomset/")

		collectionShortName := strings.TrimPrefix(r.URL.Path, "/collections/randomset/")
		fmt.Println("Collection Short Name:", collectionShortName)

		SQLQuery := func(query string, args ...interface{}) ([]map[string]interface{}, error) {
			rows, err := sqlServerDB.Query(query, args...)
			if err != nil {
				return nil, err
			}
			defer rows.Close()

			columns, err := rows.Columns()
			if err != nil {
				return nil, err
			}

			result := make([]map[string]interface{}, 0)
			values := make([]interface{}, len(columns))
			valuePointers := make([]interface{}, len(columns))

			for rows.Next() {
				for i := range columns {
					valuePointers[i] = &values[i]
				}
				if err := rows.Scan(valuePointers...); err != nil {
					return nil, err
				}

				rowMap := make(map[string]interface{})
				for i, colName := range columns {
					v := values[i]
					if b, ok := v.([]byte); ok {
						v = string(b)
					}
					rowMap[colName] = v
				}
				result = append(result, rowMap)
			}
			return result, nil
		}

		sqlAdd := ""
		if collectionShortName != "All" {
			sqlAdd = " AND (SLIDE.Column_VSB_Col1=@shortName OR SLIDE.Column_VSB_Col2=@shortName OR SLIDE.Column_VSB_Col3=@shortName) "
		}

		stmt := `
            SELECT SLIDE.COLUMN06
            FROM IMAGE
            JOIN SLIDE ON SLIDE.ID=IMAGE.PARENTID
            JOIN CORE.DATAGROUPS ON SLIDE.DATAGROUPID=CORE.DATAGROUPS.ID
            WHERE CORE.DATAGROUPS.NAME = 'EDUCATION'
            AND IMAGE.USER6 IS NOT NULL
            AND IMAGE.USER6 <> ''
            AND SLIDE.COLUMN06 IS NOT NULL
            ` + sqlAdd + `
            GROUP BY SLIDE.COLUMN06
        `

		tests, err := SQLQuery(stmt, sql.Named("shortName", collectionShortName))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		randIndices := make(map[int]bool)
		maxCount := 10
		if len(tests) < maxCount {
			maxCount = len(tests)
		}

		for len(randIndices) < maxCount && len(tests) > 0 {
			randIndices[rand.Intn(len(tests))] = true
		}

		conditions := make([]string, 0, maxCount)
		for idx := range randIndices {
			row := tests[idx]
			if row["COLUMN06"] == nil || row["COLUMN06"] == "" {
				conditions = append(conditions, fmt.Sprintf("IMAGE.PARENTID = %v", row["PARENTID"]))
			} else {
				conditions = append(conditions, fmt.Sprintf("SLIDE.COLUMN06 = '%v'", row["COLUMN06"]))
			}
		}

		sstring := strings.Join(conditions, " OR ")

		finalStmt := `
            SELECT IMAGE.IMAGEID, IMAGE.PARENTID, IMAGE.USER6, SLIDE.ID, SLIDE.DATAGROUPID,
                    SLIDE.COLUMN02, SLIDE.COLUMN03, SLIDE.COLUMN04, SLIDE.COLUMN06, SLIDE.COLUMN07,
                    SLIDE.STAINID, SLIDE.FOLDER, CORE.DATAGROUPS.ID, CORE.DATAGROUPS.NAME,
                    CORE.STAIN.ID, CORE.STAIN.SHORTNAME, BODYSITE.ID, BODYSITE.NAME
            FROM IMAGE
            JOIN SLIDE ON SLIDE.ID=IMAGE.PARENTID
            JOIN CORE.DATAGROUPS ON SLIDE.DATAGROUPID=CORE.DATAGROUPS.ID
            JOIN CORE.STAIN ON CORE.STAIN.ID=SLIDE.STAINID
            LEFT JOIN BODYSITE ON BODYSITE.ID=SLIDE.BODYSITEID
            WHERE CORE.DATAGROUPS.NAME = 'EDUCATION'
            AND IMAGE.USER6 IS NOT NULL
            AND IMAGE.USER6 <> ''
            AND (` + sstring + `)
            ORDER BY COLUMN06, BODYSITE.NAME, SHORTNAME
        `

		finalResults, err := SQLQuery(finalStmt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for _, row := range finalResults {
			if user6, ok := row["USER6"].(string); ok && user6 != "" {
				row["new_url"] = openWebScope(user6)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(finalResults)
	}
}
