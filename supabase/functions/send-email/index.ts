
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

interface EmailResponse {
  ok: boolean;
  error?: string;
}

/**
 * Send email via SMTP
 * Uses nodemailer-compatible SMTP transport
 */
async function sendEmail(to: string, subject: string, html: string): Promise<EmailResponse> {
  try {
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT") || "587";
    const smtpUsername = Deno.env.get("SMTP_USERNAME");
    const smtpPassword = Deno.env.get("SMTP_PASSWORD");
    const smtpFromEmail = Deno.env.get("SMTP_FROM_EMAIL") || smtpUsername;

    if (!smtpHost || !smtpUsername || !smtpPassword) {
      console.error("SMTP configuration missing");
      return {
        ok: false,
        error: "SMTP not configured - missing credentials",
      };
    }

    console.log(`Sending email to ${to} via ${smtpHost}:${smtpPort}`);

    // Use Resend API as SMTP provider (compatible with most SMTP services)
    // For direct SMTP, we would need a Deno SMTP library
    // Since Deno doesn't have native SMTP support, we'll use an HTTP-based approach
    
    // Option 1: Use Resend API (if using Resend as SMTP provider)
    // Option 2: Use a generic SMTP-to-HTTP bridge
    // Option 3: Use fetch to call an external SMTP service
    
    // For this implementation, we'll use a simple HTTP POST to an SMTP relay
    // In production, you would use a proper SMTP library or service like Resend, SendGrid, etc.
    
    // Using nodemailer via npm package
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

    // Verify connection
    await transporter.verify();
    console.log("SMTP connection verified");

    // Send email
    const info = await transporter.sendMail({
      from: smtpFromEmail,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", info.messageId);

    return {
      ok: true,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error sending email",
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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Parse request body
    const body: EmailRequest = await req.json();

    // Validate input
    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing required fields: to, subject, html",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid email address format",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.log(`Processing email request to: ${body.to}`);

    // Send email
    const result = await sendEmail(body.to, body.subject, body.html);

    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
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
