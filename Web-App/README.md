# Feedback Kiosk Web-App

A `react.js` application providing a frontend for feedback gathering.

## Usage

### Starting the App

`yarn` to initialize

`yarn start` to start the app

Open [http://localhost:3000](http://localhost:3000)

### Connecting the Server

The app needs the server to be running on the same host. To setup the server, please refer to the [server readme][server].

During development, the app will expect the server to listen on port [3001](http://localhost:3001).

In production, app and server should be running behind an [NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) which exposes only one port. You can forward all requests matching the `/api/` route to the server.

To switch between production and development, set the `NODE_ENV` environment variable to `production` or `development`.

You can check if the server is reachable by requesting `/api/config` from your current host.

[server]: https://github.com/neXenio/Feedback-Kiosk/tree/dev/Server
[config-json]: https://github.com/neXenio/Feedback-Kiosk/blob/dev/Server/feedback-kiosk-config.json
