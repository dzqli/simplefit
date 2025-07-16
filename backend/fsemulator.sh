docker pull gcr.io/google.com/cloudsdktool/google-cloud-cli:emulators  
docker run -it --rm \
  --name firestore-emulator \
  -p 8070:8080 \
  gcr.io/google.com/cloudsdktool/google-cloud-cli:emulators \
  gcloud emulators firestore start --host-port=0.0.0.0:8080