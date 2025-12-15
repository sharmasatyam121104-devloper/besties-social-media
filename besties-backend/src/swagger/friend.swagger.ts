const FriendApiDoc = {
    "/friend/add-friend": {
      post: {
        tags: ["Friend"],
        summary: "Send friend request",
        description: "Send a friend request to another user",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["friend"],
                properties: {
                  friend: {
                    type: "string",
                    description: "Friend user ID"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Friend request sent successfully" },
          400: { description: "Invalid request" },
          401: { description: "Unauthorized" },
          404: { description: "User or friend not found" }
        }
      }
    },

    "/friend/fetch-friend": {
      get: {
        tags: ["Friend"],
        summary: "Fetch all friends",
        description: "Fetch accepted friends and sent requests",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Friends fetched successfully"
          },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/friend/friend-suggestion": {
      get: {
        tags: ["Friend"],
        summary: "Get friend suggestions",
        description: "Returns random users excluding existing relations",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Friend suggestions fetched" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/friend/delete-friend": {
      post: {
        tags: ["Friend"],
        summary: "Delete or unfriend user",
        description: "Remove friend relationship",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["friendId"],
                properties: {
                  friendId: {
                    type: "string",
                    description: "Friend user ID"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Friend deleted successfully" },
          404: { description: "Friend record not found" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/friend/friend-request": {
      get: {
        tags: ["Friend"],
        summary: "Fetch incoming friend requests",
        description: "Returns all pending friend requests",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Friend requests fetched" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/friend/accept-request": {
      post: {
        tags: ["Friend"],
        summary: "Accept friend request",
        description: "Accept a pending friend request",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["friendId"],
                properties: {
                  friendId: {
                    type: "string",
                    description: "Sender user ID"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Friend request accepted" },
          404: { description: "Friend request not found" },
          401: { description: "Unauthorized" }
        }
      }
    }
}

export default FriendApiDoc
