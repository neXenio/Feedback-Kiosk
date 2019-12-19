# Feedback Kiosk Server

A `node.js` application exposing a web server for feedback gathering.

## Usage

### Starting the Server

`npm install` to install dependencies

`npm start` to start the server

### Configuring Feedback Options

The server attempts to parse a configuration file during startup, located at `./feedback-kiosk-config.json`. That file should be a JSON containg the feedback options:

```json
{
    "workInProgress": true
}
```

Each adapter implementation can also specify a default configuration for itself, which will be merged with whatever is specified in the config file. If no config file is available, the `debug` adapter will be used by default.

### Tracking Feedback

The server accepts `POST` requests to the `/feedback` endpoint. The body must be `application/json`, e.g.:

```json
{
    "workInProgress": true
}
```
