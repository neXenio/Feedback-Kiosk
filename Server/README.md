# Feedback Kiosk Server

A `node.js` application exposing a web server for feedback gathering.

## Usage

### Starting the Server

`npm install` to install dependencies

`npm start` to start the server

Open [http://localhost:3001](http://localhost:3001)

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
  "reward": {
    "probability": 0.5,
    "url": "/api/reward/claim",
    "message": "Congratulations, you won a reward!"
  },
  "analyticsId": "UA-XXXXXXXX-XX"
}
```

You can see the currently active configuration by sending a `GET` request to the `/api/config` endpoint.

`analyticsId` should be a [Google Analytics tracking ID](https://support.google.com/analytics/thread/13109681?hl=en) or `null`.

`completionMessage` can be set to configure a message that will be briefly displayed after completing the survey. Different options can have different completion messages.

#### Options

Options are possible feedback values that a user can select. They can be nested to create followup questions.

`id`: Unique identifier for the option. Used for analytics event tracking. Required.

`name`: Text that will be displayed. Required.

`description`: Text that will be displayed when showing the follow-up options. Required if `options` are set.

`options`: Follow-up options that will be shown together with the `description` when a user selects this option. Optional, if not set the survey is completed when a user selects this option.

`completionMessage`: Message that will be shown when the survey completed (i.e. when the user selected an option that has no more child options). Optional, will be passed down to follow-up options if not overwritten.

#### Reward

`reward` can be configured to create an incentive for users to provide feedback. A reward will be shown in form of a QR code when users complete the survey. You can configure how likely a reward QR code will be shown by setting the `probability` to a value between 0 and 1. Scanning the QR code will open the configured `url` with the encoded reward appended as query parameter.

If you set the `url` to `https://postman-echo.com/get`, scanning a reward QR code will lead the user to [https://postman-echo.com/get?reward={base64-encoded-reward}](https://postman-echo.com/get?reward=eyJpZCI6IjYzYzBhMjk3LTlhMzktNDE1OS1hNWZlLTEzNDhlNDkxMmU5NCIsInRpbWVzdGFtcCI6MTU3ODQ3NTcwODcxNCwidmVyaWZpY2F0aW9uIjoiNDI2MmRlMzFkYmJlZDU3YjliNzJlYTU0YTZkYzg3MzBmNDUxZTJiYmIzMTQxMjhkMDcxNTU0M2FlYjc1MTg5OSJ9). The encoded reward can be validated using the `/api/reward` endpoint as documented below.

If you keep the `url` at `/api/reward/claim`, the server will automatically validate the reward. You could advice your users to simply share their reward URL with you to claim a reward. You could also adjust the endpoint to include your business logic for claiming rewards (e.g. sending an email or triggering a Slack Webhook).

### Tracking Feedback

The server accepts `POST` requests to the `/api/feedback` endpoint. The body must be `application/json`, e.g.:

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

The reward generation and verification uses a secret, which you should modify by setting the `FEEDBACK_KIOSK_SECRET` environment variable. You can also change the default secret in `./routers/reward.js`

#### Creating Rewards

A `GET` request to `/reward` will create a new reward. Each reward contains a random UUID, the timestamp of generation, and a hash for verification purposes.

```json
{
  "id": "54b653dc-fe69-42b3-8fda-005a5e733e36",
  "timestamp": 1578326033098,
  "verification": "04de7357c037971561bf47f456c6fda8dce544691874f0ccd932ea97e9bbdc02"
}
```

A `GET` request to `/api/reward/qr` will `base64` encode a new reward into a QR code.

#### Verifying Rewards

A `POST` request to `/api/reward` with a request body similar to the JSON above will verify the reward. The response will be a JSON of the reward with an added `isValid` property, which is either `true` or `false`.

A `POST` request to `/api/reward/qr` with a photo of an QR code will parse and verify the encoded reward. The image must be provided as `multipart/form-data`.

```json
{
    "id": "e2e110c7-7b18-48a7-a738-aeeb010830e8",
    "timestamp": 1578401093559,
    "verification": "71cc7ef7dabc858b38e9de72a7603c5091adb16942ca2487b3530017de5f5477",
    "isValid": true
}
```
