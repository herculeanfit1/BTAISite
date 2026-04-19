import { app, HttpResponseInit } from "@azure/functions";

const startTime = Date.now();

app.http("status", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "status",
  handler: async (): Promise<HttpResponseInit> => {
    return {
      status: 200,
      jsonBody: {
        status: "online",
        environment: process.env.NODE_ENV || "production",
        timestamp: new Date().toISOString(),
        version: "0.1.0",
        uptime: (Date.now() - startTime) / 1000,
      },
    };
  },
});
