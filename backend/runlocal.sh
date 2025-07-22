docker build -t simplefit-api .
docker run --rm -it \
  -v ./secrets/db.secret.json:/app/secrets/db.secret.json \
  --env-file=.env \
  -p 8080:8080 \
  simplefit-api
