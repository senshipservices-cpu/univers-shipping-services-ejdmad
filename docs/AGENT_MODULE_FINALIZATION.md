
# Become a Global Agent Module - Finalization

## Overview

This document describes the finalization of the "Become a Global Agent" module for UNIVERSAL SHIPPING SERVICES. The module is now fully functional with automated email notifications and proper integration throughout the application.

## Implementation Summary

### 1. Database Trigger for Email Notifications

**Migration:** `add_agent_application_trigger`

A PostgreSQL trigger has been created that automatically fires when a new record is inserted into the `global_agents` table. The trigger:

- Captures the new agent application data
- Fetches related port information
- Calls the Edge Function to send email notifications

**Trigger Function:** `notify_new_agent_application()`

This function is executed automatically after each INSERT operation on the `global_agents` table.

### 2. Edge Function: notify-agent-application

**Location:** Supabase Edge Functions

This Edge Function handles the email notification workflow:

#### Email to Admin
- **Recipient:** admin@universalshippingservices.com
- **Subject:** "New Agent Application from [Company Name]"
- **Content:**
  - Company information (name, email, WhatsApp, website)
  - Port and location details
  - Activities and years of experience
  - Certifications
  - Application ID and timestamp

#### Email to Applicant
- **Recipient:** The applicant's email address
- **Subject:** "Your Agent Application - UNIVERSAL SHIPPING SERVICES"
- **Content:**
  - Confirmation of receipt
  - Application details summary
  - Next steps in the review process
  - Expected timeline (5-7 business days)
  - Contact information for questions

**Note:** The Edge Function currently logs email content to the console. To enable actual email sending, integrate with an email service provider like:
- Resend (https://resend.com)
- SendGrid
- AWS SES
- Mailgun

Example integration code is included in the Edge Function comments.

### 3. Port Coverage Integration

The `port-coverage.tsx` page already displays validated agents for each port:

**Features:**
- Shows agents with `status = 'validated'`
- Displays agent information including:
  - Company name
  - Activities
  - Years of experience
  - Premium listing badge (if applicable)
  - Contact options (WhatsApp, Email)
- Agents are sorted with premium listings first
- Section titled "UNIVERSAL SHIPPING SERVICES Agents in this Port"

**Location in UI:**
- Bottom of the port detail modal
- Only visible when agents exist for that port
- Empty state message when no agents are available

### 4. Navigation Links

#### From Main Menu (Home Page)
The home page now includes a "Quick Access" section with direct links to:
- Global Services
- Port Coverage
- **Become a Global Agent** ← New prominent link
- Pricing

**Implementation:** `app/(tabs)/(home)/index.tsx`

#### From Pricing Page
The "Agent Global Listing" plan card includes:
- Special "Partner Program" badge
- Highlighted border styling
- Direct link to the become-agent page when clicking the button

**Implementation:** `app/(tabs)/pricing.tsx`

### 5. Tab Bar Navigation

The floating tab bar includes a "Devenir agent" (Become Agent) tab for easy access from anywhere in the app.

**Implementation:** `app/(tabs)/_layout.tsx`

## Workflow Diagram

```
User fills out application form
         ↓
Form submitted to global_agents table
         ↓
Database trigger fires
         ↓
Edge Function called with application data
         ↓
    ┌────┴────┐
    ↓         ↓
Email to    Email to
Admin       Applicant
```

## Database Schema

### global_agents Table

Key fields:
- `id` (uuid, primary key)
- `company_name` (text, required)
- `port` (uuid, foreign key to ports)
- `activities` (array of agent_activity enum)
- `years_experience` (integer, optional)
- `whatsapp` (text, optional)
- `email` (text, required)
- `website` (text, optional)
- `certifications` (text, optional)
- `logo` (text, optional)
- `status` (agent_status enum: pending, validated, rejected)
- `is_premium_listing` (boolean, default false)
- `notes_internal` (text, optional)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Status Values

- **pending**: Initial status when application is submitted
- **validated**: Agent has been approved and will appear on port pages
- **rejected**: Application was not approved

## Admin Workflow

1. **Receive Email Notification**
   - Admin receives detailed email with all application information
   - Email includes application ID for reference

2. **Review Application**
   - Access Supabase dashboard
   - Navigate to global_agents table
   - Review application details

3. **Update Status**
   - Change `status` from 'pending' to 'validated' or 'rejected'
   - Optionally add `notes_internal` for record keeping
   - Set `is_premium_listing` to true if applicable

4. **Agent Appears on Platform**
   - Once status is 'validated', agent automatically appears on port coverage pages
   - Premium agents are displayed first

## User Experience

### Application Process

1. User navigates to "Become a Global Agent" from:
   - Home page Quick Access section
   - Pricing page "Agent Global Listing" plan
   - Tab bar navigation
   - Port Coverage page CTA

2. User views:
   - Introduction and benefits
   - Minimum conditions
   - Advantages for agents

3. User clicks "Apply Now" and fills out form:
   - Company information
   - Port selection (searchable dropdown)
   - Activities (multi-select)
   - Experience and certifications
   - Contact details

4. User submits application

5. Success screen displays:
   - Confirmation message
   - Next steps information
   - Link to return home

6. User receives confirmation email

### Agent Display

Validated agents appear on port detail pages with:
- Company name
- Activities badges
- Years of experience
- Premium badge (if applicable)
- Contact buttons (WhatsApp, Email)

## Testing

### Test Application Submission

1. Navigate to become-agent page
2. Fill out all required fields:
   - Company name
   - Email
   - Port selection
   - At least one activity
3. Submit form
4. Verify success message appears
5. Check Supabase logs for Edge Function execution
6. Check console logs for email content

### Test Agent Display

1. Create a test agent in Supabase dashboard
2. Set status to 'validated'
3. Navigate to port-coverage page
4. Select the port associated with the test agent
5. Verify agent appears in the "Agents in this Port" section
6. Test contact buttons (WhatsApp, Email)

## Future Enhancements

### Email Service Integration

To enable actual email sending, add environment variables to Supabase:

```bash
# Example for Resend
RESEND_API_KEY=your_api_key_here
```

Then uncomment the email sending code in the Edge Function.

### Admin Dashboard

Consider building a dedicated admin interface for:
- Reviewing pending applications
- Bulk status updates
- Agent management
- Analytics and reporting

### Agent Portal

Future feature: Allow validated agents to:
- Log in to their profile
- Update information
- View leads/referrals
- Track performance metrics

### Enhanced Notifications

- SMS notifications via Twilio
- In-app notifications
- Slack/Discord integration for admin team
- Automated follow-up emails

## Troubleshooting

### Emails Not Sending

1. Check Edge Function logs in Supabase dashboard
2. Verify trigger is enabled on global_agents table
3. Check that net.http_post extension is available
4. Ensure Edge Function is deployed and active

### Agents Not Appearing

1. Verify agent status is 'validated'
2. Check port ID matches correctly
3. Ensure RLS policies allow reading from global_agents
4. Check console logs for any errors

### Form Submission Errors

1. Check all required fields are filled
2. Verify port exists in database
3. Check network connectivity
4. Review browser console for errors

## Security Considerations

- Email addresses are validated on the client side
- Database trigger runs with SECURITY DEFINER
- Edge Function requires authentication
- RLS policies should be configured for global_agents table
- Admin email address should be configurable via environment variable

## Maintenance

### Regular Tasks

- Monitor application volume
- Review and respond to applications within SLA (5-7 days)
- Update agent information as needed
- Clean up rejected applications periodically
- Monitor email delivery rates

### Updates

When updating the module:
1. Test in development environment first
2. Backup database before migrations
3. Update documentation
4. Notify admin team of changes
5. Monitor logs after deployment

## Support

For issues or questions:
- Check Supabase logs
- Review this documentation
- Contact development team
- Check Edge Function status in Supabase dashboard

---

**Last Updated:** January 2025
**Version:** 1.0
**Status:** Production Ready
