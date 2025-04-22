# Using Postman with Qbit Auth Service

This guide explains how to test the Qbit Auth Service API endpoints using Postman.

## Setup Instructions

1. Download and install [Postman](https://www.postman.com/downloads/)
2. Import the collection:
   - Open Postman
   - Click on "Import" button (top left)
   - Select the `qbit-auth-postman-collection.json` file
   - Click "Import"

## Creating an Environment

For better testing, create a Postman environment to store variables:

1. Click on the "Environments" tab in Postman
2. Click "Create new environment"
3. Name it "Qbit Local"
4. Add these variables (leave values empty for now):
   - `accessToken`
   - `refreshToken`
5. Click "Save"
6. Select "Qbit Local" from the environment dropdown (top right)

## Testing the API

The collection includes script automation that saves tokens from login responses.

### Basic Testing Flow

1. **Login**: Run the "Login" request first
   - This will automatically save the access and refresh tokens
   - Check that you get a 200 OK response

2. **Authenticated Requests**: After login, you can test any of the authenticated endpoints:
   - "Get Profile" - Get your own user profile
   - "Get All Users" - Get list of all users (admin only)
   - "Get All Roles" - Get list of roles (admin only)

3. **Token Refresh**: If your access token expires, use the "Refresh Token" request
   - This will use your saved refresh token
   - It will automatically update your access token

## Available Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/auth/login` | POST | Login with email/password | None |
| `/auth/profile` | GET | Get current user profile | Bearer Token |
| `/auth/refresh` | POST | Refresh access token | None (needs refresh token) |
| `/users` | GET | Get all users | Bearer Token (admin) |
| `/users` | POST | Register new user | None |
| `/roles` | GET | Get all roles | Bearer Token (admin) |

## Test Credentials

- Admin User:
  - Email: `admin@qbit.com`
  - Password: `admin123`

## Troubleshooting

- If you get 401 Unauthorized errors, check if your token has expired
- If you get 403 Forbidden errors, you might not have the required role
- If the server isn't responding, ensure the auth service is running on port 3002 