const SAP_BASE = "https://my433447.businessbydesign.cloud.sap/sap/byd/odata/cust/v1/productiontask";
const SAP_AUTH = "Basic " + btoa("_PRODUCTIONT:Welcome123");

export default {
  async fetch(request) {
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

    const sapResp = await fetch(target, {
      method: request.method,
      headers: {
        "Authorization": SAP_AUTH,
        "Accept": "application/xml",
        "Content-Type": "application/json",
        "X-CSRF-Token": request.headers.get("X-CSRF-Token") || "fetch",
      },
      body: request.method === "POST" ? request.body : undefined,
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
