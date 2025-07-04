docker build -t simplefit-api .
docker run --rm -it \
  --env-file=.env \
  -p 8080:8080 \
  simplefit-api
