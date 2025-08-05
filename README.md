# Identity Doc Auth Mock

This project is a mock server for identity document authentication and verification workflows. It simulates endpoints for document verification, MRZ checks, and related flows, and is designed for integration testing and development without requiring real third-party services.

## Features

- **Express.js API** with endpoints for document verification, MRZ, and health checks
- **Redis integration** for storing and retrieving transaction tokens
- **Mocked webhook callbacks** for simulating document upload events
- **Header and payload validation** for all endpoints
- **Configurable via environment variables**

## Endpoints

### `/api/3.0/EmailAuthScore`  
- **POST**: Document verification (requires `authorization` and `content-type: application/json` headers)

### `/docv/doc_request`  
- **POST**: Initiate a document verification request

### `/dos/mrz`  
- **POST**: MRZ check (requires `client-id`, `x-correlation-id`, `client-secret`, and `content-type: application/json` headers)

### `/dos/healthcheck`  
- **GET**: Health check endpoint

## Setup

1. **Install dependencies**
   ```sh
   yarn install
   # or
   npm install
   ```

2. **Configure environment variables**  
   Create a `.env` file in the project root:
   ```
   PORT=3002
   API_KEY=your-api-key
   DEFAULT_IDP_DOCV_CALLBACK_URL=https://example.com/callback
   IDP_WEBHOOK_PATH=/webhook
   WEBHOOK_SECRET=your-webhook-secret
   REDIS_URL=redis://localhost:6379
   ```

3. **Start the server**
   ```sh
   yarn start
   # or
   npm start
   ```

## Testing

- **Run all tests**
  ```sh
  yarn test
  # or
  npm test
  ```

- **Lint the code**
  ```sh
  yarn lint
  # or
  npm run lint
  ```

## Development

- Endpoints and logic are organized under the `routes/` and `services/` directories.
- Mock data for document verification is in `data/docv/results.js`.
- Tests are in the `test/` directory and use Mocha, Chai, and Sinon.

## Public domain

This project is in the public domain within the United States, and
copyright and related rights in the work worldwide are waived through
the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0
dedication. By submitting a pull request, you are agreeing to comply
with this waiver of copyright interest.

---
**Note:** This project is for development and testing purposes only. Do not use in production environments.