# Authenticator Adapter

A `node.js` application exposing a web server that meets the [specified requirements][confluence-authenticator-adapter] for being an authenticator adapter. It serves as a bridge between the [authenticator controller][confluence-authenticator-controller] and the actual phyisical authenticator (e.g. an access control gate).

The controller can send authentication requests to this server, which will process it depending on the available adapters.

## Usage

### Starting the Server

`npm install` to install dependencies

`npm start` to start the server

### Configuring Adapters

The server attempts to parse a configuration file during startup, located at `/etc/nexenio/authenticator-adapter.conf`. That file should be a JSON containing the ID of the default adapter, as well as optional configurations for all supported adapters.

```json
{
    "defaultAdapterId": "wanzl",
    "adapters": {
        "inform": {
            "serialPorts": [ "/dev/ttyUSB0" ],
            "facilityCode": 114
        },
        "wanzl": {
            "gatewayIps": [ "10.12.10.102", "10.12.10.101" ],
            "forceOpen": true
        }
    }
}
```

Each adapter implementation can also specify a default configuration for itself, which will be merged with whatever is specified in the config file. If no config file is available, the `debug` adapter will be used by default.

### Requesting an Authentication

The server accepts `POST` requests to the `/authenticate` endpoint. The body must be `application/json` meeting the [specification][confluence-authenticator-adapter], e.g.:

```json
{
    "authenticatorProperties": {
        "id": "af4b2d89-c21a-430a-afac-b7ffcf9867ee",
        "name": "neXenio Office",
        "type": "gate",
        "gateProperties": {
            "openingIndex": 0,
            "gatewayIndex": 0,
            "direction": "entry"
        },
        "version": 123
    },
    "authenticationProperties": {
        "deviceId": "5dada2bb-745d-430b-b549-9b7523231610",
        "userId": "48571298-4aa7-4783-8a24-57b846694d00",
        "additionalData": "VGhpcyBjb3VsZCBiZSBhIHRva2Vu",
        "timestamp": 1563885861990
    }
}
```

You can specify which adapter to use by adding it to the path. If you want to use the adapter with ID `debug`, send the request to `adapters/debug/authenticate`. If no adapter is specified, the default adapter will be used.

## Adding an Adapter

Each adapter should be implemented in a separate node module in the `adapters` directory. The filename will be used as the adapter ID. An adapter implemented in `adapters/example.js` will later be exposed using the `adapters/example/authenticate` endpoint and can be configured in `config.adapters.example`.

The base functionality for every adapter is implemented in the `adapter.js` module. Each adapter module should export a class that extends `Adapter`. The class should do the following:

- Overwrite the `adapter.authorize` function with a custom implementation (optional)
- Overwrite the `adapter.authenticate` function with a custom implementation

`authorize` should return a promise that resolves with a boolean indicating if the request is authorized or not (e.g. when the user has sufficient rights). If `true`, the authentication will be invoked. If not overwrittem, every request will be treated as authorized. That might be appropriate if the implementation of `authenticate` integrates an external system that handles the authorization (e.g. KABA).

`authenticate` should return a promise that resolves with a boolean indicating if the authentication succeeded or not (e.g. when the access control gate opened).

The `authorize` and `authenticate` promises should use the `reject` method to indicate that unexpected errors occurred (e.g. network issues).

A new adapter could look like this:

```js
const Adapter = require('../adapter')

class ExampleAdapter extends Adapter {

    constructor() {
        super()
    }

    authenticate = (authenticatorProperties, authenticationProperties) => {
        return new Promise((resolve, reject) => {
            // TODO: actually do something
            resolve(true);
        })
    }

}

module.exports = ExampleAdapter
``` 

[confluence-authenticator-adapter]: https://confluence.nexenio.com/display/BA/Authenticator+Adapter
[confluence-authenticator-controller]: https://confluence.nexenio.com/display/BA/Authenticator+Controller