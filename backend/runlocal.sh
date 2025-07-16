docker build -t simplefit-api .
docker run --rm -it \
  -v ./db.secret.json:/app/db.secret.json \
  --env-file=.env \
  -p 8080:8080 \
  simplefit-api
