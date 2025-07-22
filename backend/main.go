package main

import (
    "log"
    "fmt"
    "net/http"
    "os"
    "context"
    "strings"
    "encoding/json"
    "github.com/google/uuid"
    "cloud.google.com/go/firestore"
    "google.golang.org/api/iterator"
    "google.golang.org/api/option"
    "github.com/golang-jwt/jwt/v4"
)

var jwtSecret []byte
var dbclient *firestore.Client

var whitelist = map[string]bool {
  "http://localhost:3000":   true,
  "https://simplefit.dzql.cc": true,
}

func init() {
    jwtSecret = []byte(os.Getenv("AUTH_SECRET"))
		projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
		dbID := os.Getenv("GOOGLE_DS_FIRESTORE_ID")
    if len(jwtSecret) == 0 {
        panic("AUTH_SECRET must be set")
    }
    _, err := os.Stat("secrets/db.secret.json")
		if os.IsNotExist(err) {
        panic("db.secret.json private key file is missing")
    }
    ctx := context.Background()
    sa := option.WithCredentialsFile("secrets/db.secret.json")

    dbclient, err = firestore.NewClientWithDatabase(ctx, projectID, dbID, sa)
    if err != nil {
        log.Fatalln(err)
    }
}

func main() {
    defer dbclient.Close()

    router := http.NewServeMux()

    // router.Handle("GET /", http.HandlerFunc(testHandler))
    router.Handle("GET /exercises", authMiddleware(http.HandlerFunc(getAllExercises)))
    router.Handle("PUT /exercises/{id}", authMiddleware(http.HandlerFunc(upsertExercise)))
    router.Handle("DELETE /exercises/{id}", authMiddleware(http.HandlerFunc(deleteExercise)))

    err := http.ListenAndServe(":8080", router)
    if err != nil {
        log.Fatal(err)
    }
}

// authMiddleware extracts the Bearer token, verifies its signature,
// and rejects requests with missing/invalid tokens.
func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Check the bearer token
        log.Printf("Checking Authorization header")
        auth := r.Header.Get("Authorization")
        if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
            http.Error(w, "Missing or malformed Authorization header", http.StatusUnauthorized)
            return
        }
        tokenStr := strings.TrimPrefix(auth, "Bearer ")

        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
            }
            return jwtSecret, nil
        })

        if err != nil || !token.Valid {
            http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
            return
        }

        claims := token.Claims.(jwt.MapClaims)
        email, _ := claims["email"].(string)

        // handle user creation or retrieval
        var userID string
        userIter := dbclient.Collection("users").Where("email", "==", email).Limit(1).Documents(r.Context())
        userDoc, err := userIter.Next()
        if err == iterator.Done {
            log.Printf("No user found - creating new user")
            userID = uuid.New().String()
            _, err := dbclient.Collection("users").Doc(userID).Set(r.Context(), map[string]interface{}{
                "id":    userID,
                "email": email,
            })
            if err != nil {
                http.Error(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
                return
            }
        } else if err != nil {
            log.Printf("Nope - big crash:"+err.Error())
            http.Error(w, "Failed to query user: "+err.Error(), http.StatusInternalServerError)
            return
        } else {
            log.Printf("User found!")
            userID, _ = userDoc.Data()["id"].(string)
        }

        // forward user ID and email in the request context; handle headers for CORS
        ctx := context.WithValue(r.Context(), "userID", userID)
        r = r.WithContext(ctx)

        origin := r.Header.Get("Origin")

        if whitelist[origin] {
            w.Header().Set("Access-Control-Allow-Origin", origin)
            w.Header().Set("Access-Control-Allow-Credentials", "true")
            w.Header().Set(
                "Access-Control-Allow-Headers",
                "Content-Type,Authorization",
            )
        }

        next.ServeHTTP(w, r)
    })
}

func getAllExercises(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("userID").(string)
    log.Printf("Received request for user %s exercises", userID)

    search := r.URL.Query().Get("search")
    if search != "" {
        log.Printf("Filtering exercises with search term: %s", search)
    }

    var exercises []map[string]interface{}
    var iter *firestore.DocumentIterator

    if search != "" {
        iter = dbclient.Collection("users").Doc(userID).Collection("exercises").
            Where("name", ">=", search).
            Where("name", "<", search+"\uf8ff").
            Documents(r.Context())
    } else {
        iter = dbclient.Collection("users").Doc(userID).Collection("exercises").Documents(r.Context())
    }
    for {
        doc, err := iter.Next()
        if err == iterator.Done {
            break
        }
        if err != nil {
            http.Error(w, "Failed to retrieve exercises: "+err.Error(), http.StatusInternalServerError)
            return
        }
        exercise := doc.Data()
        exercises = append(exercises, exercise)
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(exercises); err != nil {
        http.Error(w, "Failed to encode exercises: "+err.Error(), http.StatusInternalServerError)
        return
    }
    log.Printf("Exercises retrieved successfully for user %s", userID)
}

func upsertExercise(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    userID := r.Context().Value("userID").(string)
    var exercise map[string]interface{}

    if err := json.NewDecoder(r.Body).Decode(&exercise); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // request guards
    if (id == "" || id == "nil") && (exercise["id"] == nil || exercise["id"] == "") {
        http.Error(w, "Cannot create or update an exercise with no id!", http.StatusBadRequest)
        return
    }
    if (id != "" && id != "nil") && exercise["id"] != id {
        http.Error(w, "Exercise ID in URL and body must match!", http.StatusBadRequest)
        return
    }

    log.Printf("Received request for user %s exercise with id: %s", userID, exercise["id"])

    _, err := dbclient.Collection("users").Doc(userID).Collection("exercises").Doc(exercise["id"].(string)).Set(r.Context(), exercise)
    if err != nil {
        http.Error(w, "Failed to upsert exercise: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    log.Printf("Exercise %s upserted successfully for user %s", exercise["id"], userID)
}

func deleteExercise(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    userID := r.Context().Value("userID").(string)

    if id == "" {
        http.Error(w, "Exercise ID is required", http.StatusBadRequest)
        return
    }

    log.Printf("Received request to delete exercise with id: %s for user %s", id, userID)

    _, err := dbclient.Collection("users").Doc(userID).Collection("exercises").Doc(id).Delete(r.Context())
    if err != nil {
        http.Error(w, "Failed to delete exercise: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
    log.Printf("Exercise %s deleted successfully for user %s", id, userID)
}

// test endpoint, unauthenticated for now
// func testHandler(w http.ResponseWriter, r *http.Request) {
//     w.Header().Set("Content-Type", "application/json")
//     jsonData := []map[string]interface{}{
//         {"id": "push-up", "name": "Push-up", "reps": 10, "sets": 3, "weight": 50},
//         {"id": "squat", "name": "Squat", "reps": 15, "sets": 3, "weight": 110},
//         {"id": "lunge", "name": "Lunge", "reps": 12, "sets": 3, "weight": 30},
//         {"id": "plank", "name": "Plank", "reps": 1, "sets": 3, "weight": 45},
//         {"id": "burpee", "name": "Burpee", "reps": 8, "sets": 3, "weight": 35},
//     }
//     if err := json.NewEncoder(w).Encode(jsonData); err != nil {
//         http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
//     }
// }
