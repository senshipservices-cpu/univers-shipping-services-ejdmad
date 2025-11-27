
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
 * Now supports separate sandbox and live credentials
 */
async function checkPayPal(): Promise<HealthCheckResult> {
  try {
    const paypalEnv = Deno.env.get("PAYPAL_ENV") || "sandbox";

    // Validate environment value
    if (paypalEnv !== "sandbox" && paypalEnv !== "live") {
      return {
        service: "PayPal",
        ok: false,
        message: `Online payment is optional and disabled (invalid PAYPAL_ENV: ${paypalEnv}).`,
        details: { error: "PAYPAL_ENV must be 'sandbox' or 'live'" },
        isCritical: false,
      };
    }

    // Get credentials based on environment
    let clientId: string | undefined;
    let clientSecret: string | undefined;

    if (paypalEnv === "sandbox") {
      clientId = Deno.env.get("PAYPAL_SANDBOX_CLIENT_ID");
      clientSecret = Deno.env.get("PAYPAL_SANDBOX_SECRET");
    } else {
      clientId = Deno.env.get("PAYPAL_LIVE_CLIENT_ID");
      clientSecret = Deno.env.get("PAYPAL_LIVE_SECRET");
    }

    if (!clientId || !clientSecret) {
      return {
        service: "PayPal",
        ok: false,
        message: `Online payment is optional and disabled (${paypalEnv} credentials not configured).`,
        details: { 
          environment: paypalEnv,
          missingCredentials: !clientId ? "client_id" : "secret"
        },
        isCritical: false,
      };
    }

    // Determine API URL based on environment
    const apiUrl = paypalEnv === "sandbox"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    console.log(`Testing PayPal ${paypalEnv} credentials...`);

    // Test credentials by obtaining an access token
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
      console.error(`PayPal ${paypalEnv} authentication failed:`, errorData);
      return {
        service: "PayPal",
        ok: false,
        message: `Online payment is optional and disabled (${paypalEnv} authentication failed).`,
        details: { 
          environment: paypalEnv,
          status: response.status, 
          error: errorData 
        },
        isCritical: false,
      };
    }

    const data = await response.json();

    if (!data.access_token) {
      return {
        service: "PayPal",
        ok: false,
        message: `Online payment is optional and disabled (${paypalEnv} - no access token received).`,
        details: { environment: paypalEnv },
        isCritical: false,
      };
    }

    console.log(`PayPal ${paypalEnv} credentials validated successfully`);

    return {
      service: "PayPal",
      ok: true,
      message: `Online payment is enabled (${paypalEnv} mode)`,
      details: { 
        environment: paypalEnv,
        apiUrl: apiUrl,
        tokenType: data.token_type
      },
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
 * Check SMTP configuration by sending a test email
 */
async function checkSMTP(): Promise<HealthCheckResult> {
  try {
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT") || "587";
    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL") || smtpUsername;

    if (!smtpHost || !smtpUsername || !smtpPassword) {
      return {
        service: "SMTP",
        ok: false,
        message: "SMTP not configured or unreachable",
        details: { 
          error: "SMTP credentials not configured",
          missing: !smtpHost ? "SMTP_HOST" : !smtpUsername ? "SMTP_USERNAME" : "SMTP_PASSWORD"
        },
        isCritical: false,
      };
    }

    console.log(`Testing SMTP connection: ${smtpHost}:${smtpPort}`);

    // Import nodemailer for SMTP testing
    const nodemailer = await import("npm:nodemailer@6.9.8");
    
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === "465", // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      tls: {
        // Do not fail on invalid certs (for development)
        rejectUnauthorized: false,
      },
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Send a test email to the configured FROM address
    const testEmailResult = await transporter.sendMail({
      from: smtpFromEmail,
      to: smtpFromEmail,
      subject: "USS System Health Check - SMTP Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">USS System Health Check</h2>
          <p>This is an automated test email to verify SMTP configuration.</p>
          <p><strong>Status:</strong> SMTP is working correctly ✓</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent automatically by the USS health check system.
          </p>
        </div>
      `,
    });

    console.log("Test email sent successfully:", testEmailResult.messageId);

    return {
      service: "SMTP",
      ok: true,
      message: "Email notifications available",
      details: {
        host: smtpHost,
        port: smtpPort,
        from: smtpFromEmail,
        testEmailSent: true,
        messageId: testEmailResult.messageId,
      },
      isCritical: false,
    };
  } catch (error) {
    console.error("SMTP check failed:", error);
    return {
      service: "SMTP",
      ok: false,
      message: "SMTP not configured or unreachable",
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      },
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
