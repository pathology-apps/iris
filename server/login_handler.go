package main

import ()

const (
	GoodWorkstationResponse = 1
	GoodDHCPResponse        = 2
)

// LoginRequest takes 3 params
// IPAddress: To validate the user permissions based on workstation
// Username: SOFT & LDAP Username
// Password: Level-2 LDAP Password
type LoginRequest struct {
	Username string
	Password string
}

type SessionInfo struct {
	SESSIONID  int    `json:"SESSION_ID"`
	UNIQUENAME string `json:"UNIQUENAME"`
	IDSTATUS   int    `json:"ID_STATUS"`
	IDTXT      string `json:"ID_TXT"`
}

type BinsResponse struct {
	Type     string
	Current  []BinState `json:"current,omitempty"`
	Sent     []BinState `json:"sent,omitempty"`
	Expected []BinState `json:"expected,omitempty"`
}

type Destinations struct {
	Building  string `json:"building"`
	Shortcode string `json:"shortcode"`
	Name      string `json:"name"`
}

type Trip struct {
	KEY  int    `json:"KEY"`
	STP  string `json:"STP"`
	USR  string `json:"USR"`
	NAM  string `json:"NAM"`
	LOC  string `json:"LOC"`
	STTS string `json:"STTS"`
	TYPE string `json:"TYPE"`
}

type BinState struct {
	SID      int           `json:"SID"`
	USR      string        `json:"USR"`
	ISHIDDEN int           `json:"IS_HIDDEN"`
	ID       int           `json:"ID"`
	TMP      string        `json:"TMP"`
	FROM     string        `json:"FROM"`
	FROMDESC string        `json:"FROM_DESC"`
	TO       string        `json:"TO"`
	TODESC   string        `json:"TO_DESC"`
	BC       string        `json:"BC"`
	CTS      string        `json:"CTS"`
	BTS      string        `json:"BTS"`
	ERR      int           `json:"ERR"`
	MSG      string        `json:"MSG"`
	BIN      int           `json:"BIN"`
	STS      string        `json:"STS"`
	CNT      int           `json:"CNT"`
	IBIN     int           `json:"IBIN"`
	UNLD     int           `json:"UNLD"`
	TRIP     []Trip        `json:"TRIP"`
	NOTE     []interface{} `json:"NOTE"`
}

type Locations struct {
	LogInLoc  int    `json:"log_in_loc"`
	Building  string `json:"building"`
	Shortcode string `json:"shortcode"`
	Name      string `json:"name"`
	LocType   string `json:"loc_type"`
	Olcc      string `json:"olcc"`
}

type Functions struct {
	PassBarcodeCode string `json:"pass_barcode_code"`
	FuctionDesc     string `json:"fuction_desc"`
	FuctionCode     string `json:"fuction_code"`
}

// type WebLoginResponse struct {
// 	SessionInfo     SessionInfo         `json:"session_info"`
// 	WorkstationInfo jwt.WorkstationInfo `json:"workstation_info"`
// 	DhcpScanners    []interface{}       `json:"dhcp_scanners"`
// 	Destinations    []Destinations      `json:"destinations"`
// 	Locations       []Locations         `json:"locations"`
// 	Functions       []Functions         `json:"functions"`
// }

// LoginHandler routes requests from the login route to the Oracle login method
// func LoginHandler(app *App) http.HandlerFunc {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		ip := getIPAddress(r)

// 		if ip == "" {
// 			BadAuth(w, errors.New("request must contain an IP address"))
// 			return
// 		}

// 		var j LoginRequest
// 		decoderErr := json.NewDecoder(r.Body).Decode(&j)

// 		if decoderErr != nil {
// 			BadAuth(w, decoderErr)
// 			return
// 		}
// 		log.Infof("Login attempt for user: %s from IP: %s", j.Username, ip)

// 		// Login, sign token, and combine the JSON into a new structure with an accessToken key:
// 		response, responseErr := WebLogin(app, ip, j.Username, j.Password)

// 		if responseErr != nil {
// 			BadAuth(w, responseErr)
// 			return
// 		}

// 		// Unmarshal our bytes into two structures:
// 		var out map[string]interface{}
// 		responseMarshal, responMarshallErr := json.Marshal(response)

// 		if responMarshallErr != nil {
// 			BadAuth(w, responMarshallErr)
// 			return
// 		}

// 		jsonUnmarshalErr := json.Unmarshal(responseMarshal, &out)

// 		if jsonUnmarshalErr != nil {
// 			BadAuth(w, jsonUnmarshalErr)
// 			return
// 		}

// 		if response.SessionInfo.IDSTATUS != GoodWorkstationResponse && response.SessionInfo.IDSTATUS != GoodDHCPResponse {
// 			BadAuth(w, errors.New(response.SessionInfo.IDTXT))
// 			return
// 		}
// 		// Our user was able to login, store their auth in Redis:
// 		tokenStr, redisLoginErr := jwt.BuildToken(app.Secrets["JWT_SECRET"], response.WorkstationInfo)

// 		if redisLoginErr != nil {
// 			BadAuth(w, redisLoginErr)
// 			return
// 		}

// 		out["token"] = tokenStr

// 		getLoginCtx, getLoginCancel := context.WithTimeout(context.Background(), oracle.ShortTimeout*time.Second)
// 		defer getLoginCancel()

// 		strCmd := app.Bounce.Client.HGet(getLoginCtx, "persist:"+j.Username, "persist")
// 		if strCmd.Err() == nil {
// 			var persist map[string]interface{}
// 			persistUnmarshalErr := json.Unmarshal([]byte(strCmd.Val()), &persist)
// 			if persistUnmarshalErr != nil {
// 				log.Errorf("Failed to unmarshal persist data for user %s: %v", j.Username, persistUnmarshalErr)
// 			} else {
// 				out["persist"] = persist
// 			}
// 		}
// 		responseBytes, responseBytesErr := json.Marshal(out)

// 		if responseBytesErr != nil {
// 			BadAuth(w, responseBytesErr)
// 			return
// 		}

// 		w.Header().Set("Content-Type", "application/json")
// 		w.Write(responseBytes)
// 	})
// }
