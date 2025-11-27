
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

    // Test connection by making a simple request
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
 * Check Google Maps API key validity
 */
async function checkGoogleMaps(): Promise<HealthCheckResult> {
  try {
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      return {
        service: "Google Maps",
        ok: false,
        message: "Map display may be limited.",
        isCritical: false,
      };
    }

    // Test the API key with a simple Geocoding API request
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=${apiKey}`;
    
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.status !== 200) {
      return {
        service: "Google Maps",
        ok: false,
        message: `Map display may be limited (API error: ${response.status}).`,
        details: { status: response.status, error: data.error_message },
        isCritical: false,
      };
    }

    if (data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST") {
      return {
        service: "Google Maps",
        ok: false,
        message: `Map display may be limited (${data.status}).`,
        details: { status: data.status, error: data.error_message },
        isCritical: false,
      };
    }

    return {
      service: "Google Maps",
      ok: true,
      message: "Map features are enabled",
      isCritical: false,
    };
  } catch (error) {
    console.error("Google Maps check failed:", error);
    return {
      service: "Google Maps",
      ok: false,
      message: "Map display may be limited.",
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

    // Validate environment setting
    if (paypalEnv !== "sandbox" && paypalEnv !== "live") {
      return {
        service: "PayPal",
        ok: false,
        message: `Online payment is optional and disabled (invalid environment: ${paypalEnv}).`,
        isCritical: false,
      };
    }

    // Determine PayPal API URL based on environment
    const apiUrl = paypalEnv === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    // Attempt to obtain an access token
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
  // Handle CORS preflight
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

    // Run all checks in parallel
    const [supabaseResult, googleMapsResult, paypalResult, smtpResult] = await Promise.all([
      checkSupabase(),
      checkGoogleMaps(),
      checkPayPal(),
      checkSMTP(),
    ]);

    const results = [supabaseResult, googleMapsResult, paypalResult, smtpResult];

    // Determine overall status
    // Only critical services (Supabase) can cause CRITICAL status
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
