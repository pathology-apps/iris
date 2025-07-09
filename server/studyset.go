package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type StudySet struct {
	PKey        int    `json:"pkey"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Username    string `json:"username"`
}

type SlideSelectionRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Username    string `json:"username"`
	SlideIDs    []int  `json:"slide_ids,omitempty"`
}

func GetStudySets(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT PKey, Title, Description, Username FROM studyset_main ORDER BY Title")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var studySets []StudySet
		for rows.Next() {
			var ss StudySet
			err := rows.Scan(&ss.PKey, &ss.Title, &ss.Description, &ss.Username)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			studySets = append(studySets, ss)
		}

		if err = rows.Err(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(studySets)
	}
}

func GetStudySetDetails(db *sql.DB, aperioDB *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		typeParam := r.URL.Query().Get("type")
		listID := strings.TrimPrefix(r.URL.Path, "/study-sets/")

		if typeParam == "" {
			http.Error(w, "Type required to execute", http.StatusBadRequest)
			return
		}

		var (
			sqlQuery string
			rows     *sql.Rows
			err      error
		)

		switch typeParam {
		case "1":
			sqlQuery = "SELECT COUNT(Pkey) AS MyCount FROM studyset_main"
			var count int
			err = db.QueryRow(sqlQuery).Scan(&count)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			fmt.Fprintf(w, "%d", count)

		case "2":
			sqlQuery = "SELECT * FROM studyset_main ORDER BY Title DESC"
			rows, err = db.Query(sqlQuery)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var studysets []map[string]interface{}
			cols, _ := rows.Columns()
			for rows.Next() {
				rowMap := make(map[string]interface{})
				columns := make([]interface{}, len(cols))
				columnPointers := make([]interface{}, len(cols))
				for i := range columns {
					columnPointers[i] = &columns[i]
				}
				if err := rows.Scan(columnPointers...); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				for i, colName := range cols {
					rowMap[colName] = columns[i]
				}
				studysets = append(studysets, rowMap)
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(studysets)

		case "3":
			if listID == "" {
				http.Error(w, "List ID required for type 3", http.StatusBadRequest)
				return
			}
			fmt.Println("List ID:", listID)

			sqlQuery = `
				SELECT studyset_slides.mainpkey, studyset_slides.slideid
				FROM studyset_slides
				INNER JOIN studyset_main ON studyset_slides.mainpkey = studyset_main.pkey
				WHERE studyset_slides.mainpkey = $1
			`
			rows, err = db.Query(sqlQuery, listID)
			fmt.Println("Rows:", rows)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var slideData []map[string]interface{}
			var conditions []string
			for rows.Next() {
				var slideID int
				if err := rows.Scan(new(interface{}), &slideID); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				conditions = append(conditions, fmt.Sprintf("IMAGE.PARENTID = %d", slideID))
			}

			if len(conditions) == 0 {
				fmt.Println("No slides found for study set")
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(slideData)
				return
			}

			sqlQuery = fmt.Sprintf(`
				SELECT IMAGE.IMAGEID, IMAGE.PARENTID, IMAGE.USER6, SLIDE.ID,
				SLIDE.COLUMN01, SLIDE.COLUMN02, SLIDE.COLUMN03, SLIDE.COLUMN04,
				SLIDE.COLUMN06, SLIDE.COLUMN07, SLIDE.COLUMN09,
				SLIDE.STAINID, SLIDE.FOLDER, CORE.DATAGROUPS.NAME, CORE.STAIN.SHORTNAME, BODYSITE.NAME
				FROM IMAGE
				JOIN SLIDE ON SLIDE.ID = IMAGE.PARENTID
				JOIN CORE.DATAGROUPS ON SLIDE.DATAGROUPID = CORE.DATAGROUPS.ID
				JOIN CORE.STAIN ON CORE.STAIN.ID = SLIDE.STAINID
				LEFT JOIN BODYSITE ON BODYSITE.ID = SLIDE.BODYSITEID
				WHERE CORE.DATAGROUPS.NAME = 'EDUCATION' AND IMAGE.USER6 IS NOT NULL AND IMAGE.USER6 <> ''
				AND (%s)
				ORDER BY COLUMN06, BODYSITE.NAME, SHORTNAME
			`, StringJoin(conditions, " OR "))

			rows, err = aperioDB.Query(sqlQuery)
			fmt.Println("ROWS:", rows)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			cols, _ := rows.Columns()
			for rows.Next() {
				rowMap := make(map[string]interface{})
				columns := make([]interface{}, len(cols))
				columnPointers := make([]interface{}, len(cols))
				for i := range columns {
					columnPointers[i] = &columns[i]
				}
				if err := rows.Scan(columnPointers...); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				for i, colName := range cols {
					rowMap[colName] = columns[i]
				}
				if col, ok := rowMap["USER6"].(string); ok && col != "" {
					rowMap["new_url"] = openWebScope(col)
				}

				if col, ok := rowMap["COLUMN06"].(string); ok && col != "" {
					rowMap["COLUMN06"] = ComputeMD5(col)
				} else if id, ok := rowMap["PARENTID"].(int); ok {
					rowMap["COLUMN06"] = ComputeMD5(fmt.Sprint(id))
				}
				slideData = append(slideData, rowMap)
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(slideData)

		default:
			http.Error(w, "Unrecognized type. Execution failed.", http.StatusBadRequest)
		}
	}
}

func SetStudySetDetails(db *sql.DB, aperioDB *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		listID := strings.TrimPrefix(r.URL.Path, "/study-sets/")
		if listID == "" {
			http.Error(w, "List ID required", http.StatusBadRequest)
			return
		}

		var request SlideSelectionRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		if request.Title == "" {
			http.Error(w, "Title is required", http.StatusBadRequest)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		stmt, err := tx.Prepare("UPDATE studyset_main SET Title = $1, Description = $2 WHERE PKey = $3")
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer stmt.Close()

		if _, err := stmt.Exec(request.Title, request.Description, listID); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		stmtDelete := `DELETE FROM studyset_slides WHERE MainPKey = $1`
		if _, err := tx.Exec(stmtDelete, listID); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		for _, slideID := range request.SlideIDs {
			var parentID int
			query := "SELECT PARENTID FROM IMAGE WHERE IMAGEID = @ImageID"
			err := aperioDB.QueryRow(query, sql.Named("ImageID", slideID)).Scan(&parentID)
			if err != nil {
				fmt.Println("Error fetching parent ID:", err)
				http.Error(w, "Failed to fetch parent ID", http.StatusInternalServerError)
				return
			}

			stmtInsert, err := tx.Prepare("INSERT INTO studyset_slides (MainPKey, SlideID) VALUES ($1, $2)")
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			defer stmtInsert.Close()

			if _, err := stmtInsert.Exec(listID, parentID); err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
		}

		err = tx.Commit()
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Study set updated"})
	}
}

func DeleteStudySet(db *sql.DB, aperioDB *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		listID := strings.TrimPrefix(r.URL.Path, "/study-sets/")
		if listID == "" {
			http.Error(w, "List ID required", http.StatusBadRequest)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		stmtDelete := `DELETE FROM studyset_slides WHERE MainPKey = $1`
		if _, err := tx.Exec(stmtDelete, listID); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		stmt := `DELETE FROM studyset_main WHERE PKey = $1`
		if _, err := tx.Exec(stmt, listID); err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		err = tx.Commit()
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Study set deleted"})
	}
}

func CreateStudySet(db *sql.DB, aperioDb *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request SlideSelectionRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		if request.Title == "" {
			http.Error(w, "Title is required", http.StatusBadRequest)
			return
		}

		tx, err := db.Begin()
		if err != nil {
			http.Error(w, "Internal Server Error1", http.StatusInternalServerError)
			return
		}
		defer tx.Rollback()

		stmt := "INSERT INTO studyset_main (Title, Description, Username) VALUES ($1, $2, $3) RETURNING Pkey"

		// Execute the insertion and retrieve the generated Pkey
		var setID int
		err1 := db.QueryRow(stmt, request.Title, request.Description, request.Username).Scan(&setID)
		if err1 != nil {
			http.Error(w, "Internal Server Error4", http.StatusInternalServerError)
			return
		}

		// Insert related slides by cross-referencing PARENTID from aperioDb
		fmt.Println("slideIDS: ", request.SlideIDs)
		for _, slideID := range request.SlideIDs {
			var parentID int
			query := "SELECT PARENTID FROM IMAGE WHERE IMAGEID = @ImageID"

			err := aperioDb.QueryRow(query, sql.Named("ImageID", slideID)).Scan(&parentID)
			if err != nil {
				fmt.Println("Error fetching parent ID:", err)
				http.Error(w, "Failed to fetch parent ID", http.StatusInternalServerError)
				return
			}

			// Prepare the insert statement for slides
			stmtInsert, err := tx.Prepare("INSERT INTO studyset_slides (MainPKey, SlideID) VALUES ($1, $2)")
			if err != nil {
				http.Error(w, "Internal Server Error5", http.StatusInternalServerError)
				return
			}
			defer stmtInsert.Close()

			// Execute the insertion for each slide
			fmt.Println("Inserting slide with setID:", setID, "and parentID:", parentID)
			if _, err := stmtInsert.Exec(setID, parentID); err != nil {
				http.Error(w, "Internal Server Error6", http.StatusInternalServerError)
				return
			}
		}

		// Commit the transaction
		if err := tx.Commit(); err != nil {
			http.Error(w, "Internal Server Error7", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Study set created"})
	}
}
