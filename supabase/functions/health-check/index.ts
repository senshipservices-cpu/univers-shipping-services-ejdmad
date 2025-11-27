
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface HealthCheckResult {
  service: string;
  ok: boolean;
  message: string;
  details?: any;
  isCritical: boolean;
}

/**
 * Check Supabase connectivity
 */
async function checkSupabase(): Promise<HealthCheckResult> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        service: "Supabase",
        ok: false,
        message: "Database offline - Supabase credentials not configured",
        isCritical: true,
      };
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) {
      return {
        service: "Supabase",
        ok: false,
        message: `Database offline - Connection failed: ${response.statusText}`,
        isCritical: true,
      };
    }

    return {
      service: "Supabase",
      ok: true,
      message: "Database operational",
      isCritical: true,
    };
  } catch (error) {
    console.error("Supabase check failed:", error);
    return {
      service: "Supabase",
      ok: false,
      message: `Database offline - Verification failed: ${error.message}`,
      isCritical: true,
    };
  }
}

/**
 * Check Google Maps API key validity with comprehensive testing
 */
async function checkGoogleMaps(): Promise<HealthCheckResult> {
  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return {
        service: "Google Maps",
        ok: false,
        message: "Map display may be limited (NO_KEY).",
        details: { error: "GOOGLE_MAPS_API_KEY environment variable not set" },
        isCritical: false,
      };
    }

    console.log("Testing Google Maps API key...");

    // Test the API key with a simple Geocoding API request
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Paris,France&key=${apiKey}`;
    
    const response = await fetch(testUrl);
    const data = await response.json();

    console.log("Google Maps API response status:", response.status);
    console.log("Google Maps API response data:", JSON.stringify(data, null, 2));

    // Check HTTP status
    if (response.status !== 200) {
      return {
        service: "Google Maps",
        ok: false,
        message: `Map display may be limited (HTTP ${response.status}).`,
        details: { 
          status: response.status, 
          error: data.error_message || "HTTP error",
          apiStatus: data.status 
        },
        isCritical: false,
      };
    }

    // Check API response status
    if (data.status === "REQUEST_DENIED") {
      let errorDetail = "API key is invalid or restricted";
      if (data.error_message) {
        errorDetail = data.error_message;
      }
      
      return {
        service: "Google Maps",
        ok: false,
        message: `Map display may be limited (REQUEST_DENIED).`,
        details: { 
          status: data.status, 
          error: errorDetail,
          reason: "Check API key restrictions: HTTP referrers, IP addresses, or API enablement"
        },
        isCritical: false,
      };
    }

    if (data.status === "INVALID_REQUEST") {
      return {
        service: "Google Maps",
        ok: false,
        message: `Map display may be limited (INVALID_REQUEST).`,
        details: { 
          status: data.status, 
          error: data.error_message || "Invalid request format"
        },
        isCritical: false,
      };
    }

    if (data.status === "OVER_QUERY_LIMIT") {
      return {
        service: "Google Maps",
        ok: false,
        message: `Map display may be limited (OVER_QUERY_LIMIT).`,
        details: { 
          status: data.status, 
          error: "API quota exceeded"
        },
        isCritical: false,
      };
    }

    if (data.status === "ZERO_RESULTS") {
      // This is actually OK - the API is working, just no results for this query
      console.log("Google Maps API returned ZERO_RESULTS (API is working)");
    }

    // Check if we got valid results
    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      console.log("Google Maps API key is valid and working");
      return {
        service: "Google Maps",
        ok: true,
        message: "Map features are enabled",
        details: { 
          status: data.status,
          resultsCount: data.results?.length || 0
        },
        isCritical: false,
      };
    }

    // Unknown status
    return {
      service: "Google Maps",
      ok: false,
      message: `Map display may be limited (${data.status}).`,
      details: { 
        status: data.status, 
        error: data.error_message || "Unknown error"
      },
      isCritical: false,
    };
  } catch (error) {
    console.error("Google Maps check failed:", error);
    return {
      service: "Google Maps",
      ok: false,
      message: "Map display may be limited (CONNECTION_ERROR).",
      details: { error: error.message },
      isCritical: false,
    };
  }
}

/**
 * Check PayPal credentials by obtaining an access token
 */
async function checkPayPal(): Promise<HealthCheckResult> {
  try {
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_SECRET");
    const paypalEnv = Deno.env.get("PAYPAL_ENV") || "sandbox";

    if (!clientId || !clientSecret) {
      return {
        service: "PayPal",
        ok: false,
        message: "Online payment is optional and disabled.",
        isCritical: false,
      };
    }

    if (paypalEnv !== "sandbox" && paypalEnv !== "live") {
      return {
        service: "PayPal",
        ok: false,
        message: `Online payment is optional and disabled (invalid environment: ${paypalEnv}).`,
        isCritical: false,
      };
    }

    const apiUrl = paypalEnv === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    const auth = btoa(`${clientId}:${clientSecret}`);
    const tokenUrl = `${apiUrl}/v1/oauth2/token`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        service: "PayPal",
        ok: false,
        message: "Online payment is optional and disabled (authentication failed).",
        details: { status: response.status, error: errorData },
        isCritical: false,
      };
    }

    const data = await response.json();

    if (!data.access_token) {
      return {
        service: "PayPal",
        ok: false,
        message: "Online payment is optional and disabled (no access token received).",
        isCritical: false,
      };
    }

    return {
      service: "PayPal",
      ok: true,
      message: `Online payment is enabled (${paypalEnv} mode)`,
      details: { environment: paypalEnv },
      isCritical: false,
    };
  } catch (error) {
    console.error("PayPal check failed:", error);
    return {
      service: "PayPal",
      ok: false,
      message: "Online payment is optional and disabled.",
      details: { error: error.message },
      isCritical: false,
    };
  }
}

/**
 * Check SMTP configuration
 */
async function checkSMTP(): Promise<HealthCheckResult> {
  try {
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");

    if (!smtpHost || !smtpUsername || !smtpPassword) {
      return {
        service: "SMTP",
        ok: false,
        message: "Email features are optional and not configured.",
        isCritical: false,
      };
    }

    return {
      service: "SMTP",
      ok: true,
      message: "Email notifications available",
      isCritical: false,
    };
  } catch (error) {
    console.error("SMTP check failed:", error);
    return {
      service: "SMTP",
      ok: false,
      message: "Email features are optional and not configured.",
      isCritical: false,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    console.log("Starting health check...");

    const [supabaseResult, googleMapsResult, paypalResult, smtpResult] = await Promise.all([
      checkSupabase(),
      checkGoogleMaps(),
      checkPayPal(),
      checkSMTP(),
    ]);

    const results = [supabaseResult, googleMapsResult, paypalResult, smtpResult];

    const hasCriticalErrors = results.some((r) => !r.ok && r.isCritical);
    const hasWarnings = results.some((r) => !r.ok && !r.isCritical);

    let overall: "healthy" | "degraded" | "critical";
    if (hasCriticalErrors) {
      overall = "critical";
    } else if (hasWarnings) {
      overall = "degraded";
    } else {
      overall = "healthy";
    }

    console.log("Health check complete:", overall);

    return new Response(
      JSON.stringify({
        overall,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Health check error:", error);
    return new Response(
      JSON.stringify({
        error: "Health check failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
