import { app, HttpRequest, HttpResponseInit } from "@azure/functions";

app.http("cspReport", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "csp-report",
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      const report = (body["csp-report"] || {}) as Record<string, unknown>;

      console.warn("CSP Violation:", {
        blockedUri: report["blocked-uri"],
        violatedDirective: report["violated-directive"],
        documentUri: report["document-uri"],
        originalPolicy: report["original-policy"],
        disposition: report["disposition"],
        effectiveDirective: report["effective-directive"],
        timeStamp: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
      });

      return { status: 204 };
    } catch (error) {
      console.error("Error processing CSP report:", error);
      return {
        status: 500,
        jsonBody: { error: "Failed to process CSP report" },
      };
    }
  },
});
