
# Become a Global Agent Module

## Overview

The "Become a Global Agent" module allows companies to apply to become 3S Global agents in specific ports. This module includes a public application form, automatic data storage, and notification system.

## Features Implemented

### 1. Public Application Form
- **Location**: `app/(tabs)/become-agent.tsx`
- **Access**: Public (no authentication required)
- **Features**:
  - Multi-step form with validation
  - Port selection with search functionality
  - Multiple activity selection
  - Company information collection
  - Contact details (email, phone, WhatsApp)
  - Optional fields (website, certifications, message)
  - Real-time form validation
  - Success/error feedback

### 2. Database Integration
- **Table**: `global_agents`
- **Status**: All applications are saved with `status = 'pending'`
- **RLS Policy**: Updated to allow public insertions
- **Fields Collected**:
  - company_name
  - port (foreign key to ports table)
  - activities (array of agent_activity enum)
  - years_experience
  - email
  - phone
  - whatsapp
  - website
  - certifications
  - notes_internal (stores contact name, phone, and message)

### 3. Edge Function
- **Name**: `submit-agent-application`
- **Purpose**: Handles form submission, data validation, and notifications
- **Functionality**:
  - Validates and inserts application data
  - Retrieves port information for emails
  - Prepares confirmation email for applicant
  - Prepares notification email for admin
  - Returns success/error response

### 4. Multilingual Support
- **Languages**: French, English, Spanish, Arabic
- **Translation Keys**: All form labels, placeholders, and messages are translated
- **Context**: Uses `LanguageContext` for dynamic language switching

## User Flow

1. **Landing Page**:
   - User sees benefits of becoming an agent
   - Requirements are clearly displayed
   - "Apply" button triggers the application form

2. **Application Form**:
   - User fills in company information
   - Selects port from searchable list
   - Chooses relevant activities (multi-select)
   - Provides years of experience
   - Optionally adds certifications and message
   - Form validates all required fields

3. **Submission**:
   - Edge function processes the application
   - Data is saved to `global_agents` table
   - Confirmation message is shown to user
   - Admin receives notification (logged in Edge Function)

4. **Post-Submission**:
   - User sees success message
   - Form is reset
   - User can submit another application or navigate away

## Technical Implementation

### Form Validation
```typescript
- Company Name: Required, non-empty
- Contact Name: Required, non-empty
- Email: Required, valid email format
- Phone: Required, non-empty
- Port: Required, must select from list
- Activities: Required, at least one selected
- Years of Experience: Required, must be a number
```

### Modal Pickers
- **Port Picker**: Searchable modal with all active ports
- **Activity Picker**: Multi-select modal with checkboxes

### Error Handling
- Field-level validation with error messages
- Form-level validation before submission
- Network error handling with user feedback
- Loading states during submission

## Database Schema

### RLS Policies
```sql
-- Allow public insertions (applications)
CREATE POLICY "Anyone can insert agent applications"
ON global_agents
FOR INSERT
TO public
WITH CHECK (true);

-- Public can view validated agents only
CREATE POLICY "Public can view validated agents"
ON global_agents
FOR SELECT
TO public
USING (status = 'validated');

-- Authenticated users can update/delete
-- (for admin functionality)
```

## Email Integration (Future Enhancement)

The Edge Function is prepared for email integration. To enable:

1. **Choose Email Service**: Resend, SendGrid, AWS SES, etc.
2. **Add API Key**: Set environment variable in Supabase
3. **Uncomment Email Code**: In `submit-agent-application` Edge Function
4. **Configure Templates**: Create HTML email templates

Example with Resend:
```typescript
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'noreply@3sglobal.com',
    to: applicationData.email,
    subject: 'Your 3S Global Agent Application',
    html: emailTemplate,
  }),
});
```

## Admin Workflow (Future)

1. **View Applications**: Admin dashboard shows all pending applications
2. **Review Details**: View all submitted information
3. **Validate/Reject**: Change status to 'validated' or 'rejected'
4. **Contact Applicant**: Use provided contact information
5. **Enable Premium**: Optionally enable premium listing

## Port Coverage Integration

Once an agent is validated (`status = 'validated'`):
- Agent appears in the Port Coverage page
- Listed under their selected port
- Shows activities, experience, and contact info
- Premium agents get special badge

## Testing

### Manual Testing Checklist
- [ ] Form displays correctly on all screen sizes
- [ ] All translations work in FR/EN/ES/AR
- [ ] Port picker shows all active ports
- [ ] Port search filters correctly
- [ ] Activity picker allows multiple selections
- [ ] Form validation catches all errors
- [ ] Submission creates database record
- [ ] Success message displays correctly
- [ ] Form resets after successful submission
- [ ] Error handling works for network issues

### Test Data
```typescript
// Sample application data
{
  company_name: "Test Maritime Services",
  contact_name: "John Doe",
  email: "john@testmaritime.com",
  phone: "+33 6 12 34 56 78",
  port_id: "<valid-port-uuid>",
  activities: ["consignation", "customs"],
  years_experience: 10,
  website: "https://testmaritime.com",
  certifications: "ISO 9001, IATA",
  message: "We have extensive experience in the region"
}
```

## Future Enhancements

1. **File Upload**: Allow logo and certification document uploads
2. **Multi-Port Selection**: Allow agents to apply for multiple ports
3. **Application Tracking**: Let applicants check their application status
4. **Admin Dashboard**: Full admin interface for managing applications
5. **Email Notifications**: Automated emails for applicants and admins
6. **SMS Notifications**: WhatsApp/SMS notifications for urgent updates
7. **Application Analytics**: Track application sources and conversion rates
8. **Agent Portal**: Dedicated portal for validated agents

## Troubleshooting

### Common Issues

**Issue**: Form submission fails
- Check Supabase connection
- Verify Edge Function is deployed
- Check browser console for errors
- Verify RLS policies are correct

**Issue**: Port picker is empty
- Check ports table has data with `status = 'actif'`
- Verify RLS policy allows public read on ports

**Issue**: Translations not working
- Verify language is set in LanguageContext
- Check translation keys exist in translations.ts
- Ensure language selection was completed

## API Reference

### Edge Function Endpoint
```
POST /functions/v1/submit-agent-application
```

**Request Body**:
```json
{
  "company_name": "string",
  "port_id": "uuid",
  "activities": ["string"],
  "years_experience": number,
  "contact_name": "string",
  "email": "string",
  "phone": "string",
  "whatsapp": "string (optional)",
  "website": "string (optional)",
  "certifications": "string (optional)",
  "message": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": "uuid"
}
```

## Maintenance

### Regular Tasks
- Monitor pending applications
- Review and validate applications within 3-5 business days
- Update activity options as needed
- Keep port list up to date
- Monitor Edge Function logs for errors

### Database Maintenance
```sql
-- View pending applications
SELECT * FROM global_agents WHERE status = 'pending' ORDER BY created_at DESC;

-- Count applications by status
SELECT status, COUNT(*) FROM global_agents GROUP BY status;

-- Find applications older than 7 days
SELECT * FROM global_agents 
WHERE status = 'pending' 
AND created_at < NOW() - INTERVAL '7 days';
```

## Support

For issues or questions:
- Check Edge Function logs in Supabase dashboard
- Review database RLS policies
- Verify form validation logic
- Test with different browsers and devices
