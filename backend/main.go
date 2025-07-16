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
    firebase "firebase.google.com/go"
    "cloud.google.com/go/firestore"
    "google.golang.org/api/iterator"
    "google.golang.org/api/option"
    "github.com/golang-jwt/jwt/v4"
)

var jwtSecret []byte

var whitelist = map[string]bool {
  "http://localhost:3000":   true,
  "https://simplefit.dzql.cc": true,
}

func init() {
    jwtSecret = []byte(os.Getenv("AUTH_SECRET"))
    if len(jwtSecret) == 0 {
        panic("AUTH_SECRET must be set")
    }
    if _, err := os.Stat("db.secret.json"); os.IsNotExist(err) {
        panic("db.secret.json private key file is missing")
    }
}

func main() {
    ctx := context.Background()
    sa := option.WithCredentialsFile("db.secret.json")
    app, err := firebase.NewApp(ctx, nil, sa)
    if err != nil {
        log.Fatalln(err)
    }

    client, err := app.Firestore(ctx)
    if err != nil {
        log.Fatalln(err)
    }
    defer client.Close()

    router := http.NewServeMux()

    router.Handle("GET /", http.HandlerFunc(testHandler))
    router.Handle("GET /exercises", authMiddleware(client)(http.HandlerFunc(getAllExercises)))
    router.Handle("PUT /exercises/{id}", authMiddleware(client)(http.HandlerFunc(upsertExercise)))
    router.Handle("DELETE /exercises/{id}", authMiddleware(client)(http.HandlerFunc(deleteExercise)))

    err = http.ListenAndServe(":8080", router)
    if err != nil {
        log.Fatal(err)
    }
}

// authMiddleware extracts the Bearer token, verifies its signature,
// and rejects requests with missing/invalid tokens.
func authMiddleware(client *firestore.Client) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
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
                // Ensure the token’s alg matches what you expect:
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
            log.Printf("Checking user with email: %s", email)
            var userID string
            userIter := client.Collection("users").Where("email", "==", email).Limit(1).Documents(r.Context())
            userDoc, err := userIter.Next()
            if err == iterator.Done {
                log.Printf("No user found - creating new user")
                userID = uuid.New().String()
                _, err := client.Collection("users").Doc(userID).Set(r.Context(), map[string]interface{}{
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
            ctx = context.WithValue(ctx, "email", email)
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
}

func getAllExercises(w http.ResponseWriter, r *http.Request) {
    email := r.Context().Value("email").(string)
    userID := r.Context().Value("userID").(string)
    log.Printf("User email: %s", email)
    log.Printf("User ID: %s", userID)

    w.Header().Set("Content-Type", "application/json")
    jsonData := []map[string]interface{}{
        {"id": "push-up", "name": "Push-up", "reps": 10, "sets": 3, "weight": 50},
        {"id": "squat", "name": "Squat", "reps": 15, "sets": 3, "weight": 110},
        {"id": "lunge", "name": "Lunge", "reps": 12, "sets": 3, "weight": 30},
        {"id": "plank", "name": "Plank", "reps": 1, "sets": 3, "weight": 45},
        {"id": "burpee", "name": "Burpee", "reps": 8, "sets": 3, "weight": 35},
    }
    if err := json.NewEncoder(w).Encode(jsonData); err != nil {
        http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
    }
}

func upsertExercise(w http.ResponseWriter, r *http.Request) {
    email := r.Context().Value("email").(string)
    log.Printf("User email: %s", email)
    id := r.PathValue("id")
    log.Printf("Received request for exercise with id: %s", id)

    w.Header().Set("Content-Type", "application/json")
    var exercise map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&exercise); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }
    // Echoing it back for now
    if err := json.NewEncoder(w).Encode(exercise); err != nil {
        http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
    }
}

func deleteExercise(w http.ResponseWriter, r *http.Request) {
    // This is a placeholder for the delete operation
    w.WriteHeader(http.StatusNoContent) // No content response
}

// test endpoint, unauthenticated for now
func testHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    jsonData := []map[string]interface{}{
        {"id": "push-up", "name": "Push-up", "reps": 10, "sets": 3, "weight": 50},
        {"id": "squat", "name": "Squat", "reps": 15, "sets": 3, "weight": 110},
        {"id": "lunge", "name": "Lunge", "reps": 12, "sets": 3, "weight": 30},
        {"id": "plank", "name": "Plank", "reps": 1, "sets": 3, "weight": 45},
        {"id": "burpee", "name": "Burpee", "reps": 8, "sets": 3, "weight": 35},
    }
    if err := json.NewEncoder(w).Encode(jsonData); err != nil {
        http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
    }
}
