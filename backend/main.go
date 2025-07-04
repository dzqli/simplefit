package main

import (
    "log"
    "fmt"
    "net/http"
    "os"
    "strings"
    "encoding/json"
    "github.com/golang-jwt/jwt/v4"
)

var jwtSecret []byte

var whitelist = map[string]bool {
  "http://localhost:3000":   true,
  "https://simplefit.dzql.cc": true,
}

func init() {
    // Load the same secret your auth service uses:
    jwtSecret = []byte(os.Getenv("AUTH_SECRET"))
    if len(jwtSecret) == 0 {
        panic("AUTH_SECRET must be set")
    }
}

func main() {
    router := http.NewServeMux()

    router.Handle("GET /", authMiddleware(http.HandlerFunc(testAuthenticatedHandler)))
    router.Handle("GET /exercises", http.HandlerFunc(getAllExercises))

    err := http.ListenAndServe(":8080", router)
    if err != nil {
        log.Fatal(err)
    }
}

// authMiddleware extracts the Bearer token, verifies its signature,
// and rejects requests with missing/invalid tokens.
func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

        // At this point token.Claims contains your custom claims,
        // e.g. user ID, roles, etc. You can cast to jwt.MapClaims:
        // claims := token.Claims.(jwt.MapClaims)
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

// test endpoint, unauthenticated for now
func getAllExercises(w http.ResponseWriter, r *http.Request) {
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

func testAuthenticatedHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "✅ Authorized!")
}
