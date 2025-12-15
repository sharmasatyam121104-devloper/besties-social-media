const AuthApiDoc = {
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullname", "email", "password"],
                properties: {
                  fullname: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  mobile: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Signup success" },
          400: { description: "Invalid input" }
        }
      }
    },

    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user and set auth cookies",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Login success (cookies set)" },
          401: { description: "Invalid credentials" },
          404: { description: "User not found" }
        }
      }
    },

    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user and clear cookies",
        responses: {
          200: { description: "Logout success" }
        }
      }
    },

    "/auth/refresh-token": {
      get: {
        tags: ["Auth"],
        summary: "Refresh access and refresh token using refresh cookie",
        responses: {
          200: { description: "Token refreshed successfully" },
          401: { description: "Refresh token invalid or expired" }
        }
      }
    },

    "/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Get current user session using access token cookie",
        responses: {
          200: {
            description: "Valid session",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    fullname: { type: "string" },
                    email: { type: "string" },
                    mobile: { type: "string" },
                    image: { type: "string", nullable: true }
                  }
                }
              }
            }
          },
          401: { description: "Invalid session" }
        }
      }
    },

    "/auth/profile-picture": {
      put: {
        tags: ["Auth"],
        summary: "Update user profile picture",
        security: [
          { cookieAuth: [] }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["path"],
                properties: {
                  path: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Profile picture updated" },
          401: { description: "Unauthorized" }
        }
      }
    }
}

export default AuthApiDoc
