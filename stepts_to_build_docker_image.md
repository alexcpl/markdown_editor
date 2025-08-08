docker build --platform linux/amd64 -t markdown-editor:latest .
docker save --output ~/Desktop/markdown-editor.tar markdown-editor:latest

scp to server

docker load -i markdown-editor.tar
docker run -d -p 3003:3001 --name markdown-editor-container markdown-editor:latest