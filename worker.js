const SAP_BASE = "https://my433447.businessbydesign.cloud.sap/sap/byd/odata/cust/v1/productiontask";
const SAP_AUTH = "Basic " + btoa("_PRODUCTIONT:Welcome123");

export default {
  async fetch(request) {

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    const url = new URL(request.url);
    const target = SAP_BASE + url.pathname + url.search;

    // For POST requests, first fetch a valid CSRF token from SAP
    if (request.method === "POST") {
      // Step 1: GET the service root to obtain a valid CSRF token
      const tokenResp = await fetch(SAP_BASE + "/ProductionTaskCollection?$top=1", {
        method: "GET",
        headers: {
          "Authorization": SAP_AUTH,
          "X-CSRF-Token": "fetch",
          "Accept": "application/xml",
        },
      });

      const csrfToken = tokenResp.headers.get("x-csrf-token") || tokenResp.headers.get("X-CSRF-Token");
      const cookies = tokenResp.headers.get("set-cookie") || "";

      // Step 2: Use the fetched CSRF token for the actual POST
      const sapResp = await fetch(target, {
        method: "POST",
        headers: {
          "Authorization": SAP_AUTH,
          "Accept": "application/xml",
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken || "fetch",
          "Cookie": cookies,
        },
        body: request.body || null,
      });

      const body = await sapResp.text();

      return new Response(body, {
        status: sapResp.status,
        headers: {
          "Content-Type": sapResp.headers.get("Content-Type") || "application/xml",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "X-CSRF-Used": csrfToken || "none",
        },
      });
    }

    // For GET requests, pass through directly
    const sapResp = await fetch(target, {
      method: "GET",
      headers: {
        "Authorization": SAP_AUTH,
        "Accept": "application/xml",
        "X-CSRF-Token": "fetch",
      },
    });

    const body = await sapResp.text();

    return new Response(body, {
      status: sapResp.status,
      headers: {
        "Content-Type": sapResp.headers.get("Content-Type") || "application/xml",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }
};
