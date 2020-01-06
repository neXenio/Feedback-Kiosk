# Feedback Kiosk Server

A `node.js` application exposing a web server for feedback gathering.

## Usage

### Starting the Server

`npm install` to install dependencies

`npm start` to start the server

Open [http://localhost:8080](http://localhost:8080)

### Configuring Feedback Options

The server attempts to parse a configuration file during startup, located at `./feedback-kiosk-config.json`. You can also use the `FEEDBACK_KIOSK_CONFIG` environment variable to specify a different file location. That file should be a JSON containg the feedback options:

```json
{
  "id": "beer-survey",
  "name": "Beer Survey",
  "description": "What do you think about our beer on tap?",
  "options": [
    {
      "id": "like",
      "name": "Awesome!",
      "completionMessage": "Glad you like it!"
    },
    {
      "id": "dislike",
      "name": "Meh.",
      "completionMessage": "Thanks for your feedback.",
      "description": "What don't you like about it?",
      "options": [
        {
          "id": "dislike-unhealthy",
          "name": "It's unhealthy"
        },
        {
          "id": "dislike-temperature",
          "name": "It's not cold"
        },
        {
          "id": "dislike-taste",
          "name": "Tastes aweful"
        }
      ]
    }
  ],
  "analyticsId": "UA-XXXXXXXX-XX"
}
```

Options can be nested to create followup questions.

The `analyticsId` should be a [Google Analytics tracking ID](https://support.google.com/analytics/thread/13109681?hl=en) or `null`.

The `completionMessage` can be set to configure a message that will be briefly displayed after completing the survey. Different options can have different completion messages.

You can see the currently active configuration by sending a `GET` request to the `/config` endpoint.

### Tracking Feedback

The server accepts `POST` requests to the `/feedback` endpoint. The body must be `application/json`, e.g.:

```json
{
  "sessionId": "17a171a7-cbf8-421c-820d-69157d949330",
  "selectedOption": {
    "id": "like",
    "name": "Awesome!",
    "path": "beer-survey/like"
  }
}
```

The `sessionId` should be a new random UUID each time a user new starts interacting with the form.

The `path` should be a concatenated string of all the parent option `id` fields, separated with a `/`, ending with the selected option `id`.

### Websocket

Submitted feedback will be emitted by a [socket.io](https://socket.io/) server.

Clients can connect to it and listen for the `feedback-received` event. A demo implementation that logs events to the consolse can be found at `/socket`.

### Rewards

The web-app can provide rewards that users may receive after submitting feedback.

#### Creating Rewards

A `GET` request to `/reward` will create a new reward. Each reward contains a random UUID, the timestamp of generation, and a hash for verification purposes.

```json
{
  "id": "32950d1a-57c0-4266-bace-d933194cfae8",
  "timestamp": 1578324375962,
  "verification": "8c396421c23a56b771f4b3480b724f238d699e3470293658a3dcaa0f009d517a"
}
```

#### Verifying Rewards

A `POST` request to `/reward` with a request body similar to the JSON above will verify the reward. The response status code will be `200` if the reward is valid or `401` if not.

The reward generation and verification uses a secret, which you can modify by setting the `FEEDBACK_KIOSK_SECRET` environment variable.


