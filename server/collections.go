package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

type Collection struct {
	ID          int    `json:"id"`
	Collection  string `json:"collection"`
	Group       string `json:"group"`
	Description string `json:"description"`
	Count       int    `json:"count"`
}

type CollectionItem struct {
	IMAGEID   int    `json:"id"`
	USER6     string `json:"link"`
	COLUMN03  string `json:"diagnosis"`
	COLUMN02  string `json:"organ"`
	COLUMN06  string `json:"accession"`
	SHORTNAME string `json:"stain"`
	NewURL    string `json:"new_url"`
	PARENTID  string `json:"parent_id"`
}

func UpdateCollection(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /collections/updatecollection/")

		id := strings.TrimPrefix(r.URL.Path, "/collections/updatecollection/")

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

		var collection Collection
		if err := json.Unmarshal(body, &collection); err != nil {
			http.Error(w, "Invalid input data", http.StatusBadRequest)
			return
		}

		stmt := `UPDATE collections SET Display_Name = $1, Descrip = $2, Short_Name = $3 WHERE PKey = $4`
		if _, err := db.Exec(stmt, collection.Collection, collection.Group, collection.Description, id); err != nil {
			http.Error(w, "Failed to update collection", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Collection updated successfully")
	}
}

func AddCollection(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /collections/addcollection")

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

		var collection Collection
		if err := json.Unmarshal(body, &collection); err != nil {
			http.Error(w, "Invalid input data", http.StatusBadRequest)
			return
		}

		stmt := `INSERT INTO collections (Display_Name, Descrip, Short_Name) VALUES ($1, $2, $3)`
		if _, err := db.Exec(stmt, collection.Collection, collection.Group, collection.Description); err != nil {
			http.Error(w, "Failed to add collection", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Collection added successfully")
	}
}

func DeleteCollection(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /collections/deletecollection/")

		id := strings.TrimPrefix(r.URL.Path, "/collections/deletecollection/")

		if r.Method != http.MethodDelete {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		stmt := `DELETE FROM collections WHERE PKey = $1`
		if _, err := db.Exec(stmt, id); err != nil {
			http.Error(w, "Failed to delete collection", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "Collection deleted successfully")
	}
}

func GetCollections(db *sql.DB, sqlServerDB *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /collections")

		var totalSlideCount int
		err := sqlServerDB.QueryRow(`
            SELECT COUNT(Slide.ID) AS MyCount
            FROM IMAGE
            JOIN Slide ON Slide.Id=Image.ParentId
            WHERE Slide.DataGroupId = 56
                AND Image.User6 IS NOT NULL
                AND Image.User6 <> ''
        `).Scan(&totalSlideCount)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		collections := []Collection{{
			ID:          0,
			Collection:  "All",
			Group:       "All",
			Description: "All",
			Count:       totalSlideCount,
		}}

		rows, err := db.Query("SELECT PKey, Display_Name, Descrip, Short_Name FROM collections ORDER BY Display_Name")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		countStmt, err := sqlServerDB.Prepare(`
            SELECT COUNT(Slide.ID) AS MyCount
            FROM IMAGE
            JOIN Slide ON Slide.Id=Image.ParentId
            WHERE Slide.DataGroupId = 56
                AND Image.User6 IS NOT NULL
                AND Image.User6 <> ''
                AND (Slide.Column_VSB_Col1=@Short_Name 
                     OR Slide.Column_VSB_Col2=@Short_Name 
                     OR Slide.Column_VSB_Col3=@Short_Name)
        `)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer countStmt.Close()

		for rows.Next() {
			var c Collection
			err := rows.Scan(&c.ID, &c.Collection, &c.Group, &c.Description)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// TODO: Uncomment this block if you want to fetch the count for each collection
			// ************************************ //
			// var count int
			// err = countStmt.QueryRow(sql.Named("Short_Name", c.Description)).Scan(&count)
			// if err != nil {
			// 	http.Error(w, err.Error(), http.StatusInternalServerError)
			// 	return
			// }
			// c.Count = count
			// ************************************ //

			c.Count = 0
			collections = append(collections, c)
		}

		if rows.Err() != nil {
			http.Error(w, rows.Err().Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(collections)
	}
}

func GetCollectionItems(sqlServerDB *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Received request for /collections/")

		collectionShortName := strings.TrimPrefix(r.URL.Path, "/collections/")
		sqlAdd := ""
		if collectionShortName != "All" {
			sqlAdd = " AND (SLIDE.Column_VSB_Col1=@shortName OR SLIDE.Column_VSB_Col2=@shortName OR SLIDE.Column_VSB_Col3=@shortName) "
		}
		stmt := fmt.Sprintf(`
            SELECT IMAGE.IMAGEID, IMAGE.USER6, SLIDE.COLUMN02, SLIDE.COLUMN03, SLIDE.COLUMN06, CORE.STAIN.SHORTNAME, IMAGE.PARENTID
            FROM IMAGE
            JOIN SLIDE ON SLIDE.ID = IMAGE.PARENTID
            JOIN CORE.DATAGROUPS ON SLIDE.DATAGROUPID = CORE.DATAGROUPS.ID
            JOIN CORE.STAIN ON CORE.STAIN.ID = SLIDE.STAINID
            LEFT JOIN BODYSITE ON BODYSITE.ID = SLIDE.BODYSITEID
            WHERE CORE.DATAGROUPS.NAME = 'EDUCATION'
            AND IMAGE.USER6 IS NOT NULL
            AND IMAGE.USER6 <> ''
            %s
            ORDER BY COLUMN06, BODYSITE.NAME, SHORTNAME`, sqlAdd)

		rows, err := sqlServerDB.Query(stmt, sql.Named("shortName", collectionShortName))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var items []CollectionItem
		for rows.Next() {
			var item CollectionItem
			var user6, column03, column02, column06, shortname, parentid sql.NullString

			if err := rows.Scan(&item.IMAGEID, &user6, &column02, &column03, &column06, &shortname, &parentid); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			item.USER6 = user6.String
			item.COLUMN03 = column03.String
			item.COLUMN02 = column02.String
			if column06.String == "" {
				item.COLUMN06 = ComputeMD5(parentid.String)
			} else {
				item.COLUMN06 = ComputeMD5(column06.String)
			}
			item.SHORTNAME = shortname.String

			if item.COLUMN03 == "" {
				item.COLUMN03 = "Unknown"
			}

			item.NewURL = openWebScope(item.USER6)
			items = append(items, item)
		}

		if err = rows.Err(); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(items)
	}
}
