const StorageApiDoc = {
    "/storage/upload": {
      post: {
        tags: ["Storage"],
        summary: "Generate upload URL for file",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["path", "type", "status"],
                properties: {
                  path: { type: "string", example: "profile-pictures/user123.png" },
                  type: { type: "string", example: "image/png" },
                  status: { type: "string", example: "public-read" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Upload URL generated successfully" },
          400: { description: "Invalid request" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/storage/download": {
      post: {
        tags: ["Storage"],
        summary: "Generate download URL for file",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["path"],
                properties: {
                  path: { type: "string", example: "profile-pictures/user123.png" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Download URL generated successfully" },
          400: { description: "Path missing" },
          401: { description: "Unauthorized" }
        }
      }
    }
}

export default StorageApiDoc
