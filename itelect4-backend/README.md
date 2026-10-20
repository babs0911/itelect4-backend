# Library Book Reservation API

Express and MongoDB API for the Library Book Reservation frontend.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set the MongoDB URI and JWT secret.
3. Start the API with `npm run dev`.
4. Seed or refresh the sample catalog with `npm run seed:books`.

The API listens on port `4000` by default. `CORS_ORIGIN` accepts a comma-separated list of frontend origins.

## Routes

- `GET /api/health` reports the database connection state.
- `GET /api/books` and `GET /api/books/:id` are public catalog reads.
- `POST /api/auth/register` and `POST /api/auth/login` issue JWTs.
- Reservation routes require `Authorization: Bearer <token>`.

## Vercel deployment

Create a Vercel project from the backend repository and set its Root Directory to `itelect4-backend`. Add `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` as project environment variables for the environments being deployed. Once the frontend is deployed, set `CORS_ORIGIN` to its exact origin and redeploy. Verify that `/api/health` returns JSON with `"db": true`.

Set the Vercel Production environment's Branch Tracking setting to `gt4-part2` so production deployments use the configured branch.

The Atlas network access list must permit the deployed backend to connect. Allowing `0.0.0.0/0` permits connections from any IP; restrict it to trusted addresses when the deployment environment supports stable egress IPs.
