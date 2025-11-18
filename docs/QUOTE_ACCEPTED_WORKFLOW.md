
# Quote Accepted Workflow Implementation

## Overview
This document describes the automatic event logging workflow that triggers when a client accepts a freight quote.

## Workflow Details

### Trigger
- **Table**: `freight_quotes`
- **Field**: `client_decision`
- **Condition**: When `client_decision` changes to `'accepted'`

### Action
When the trigger fires, a new entry is automatically created in the `events_log` table with the following data:

- `event_type` = `"quote_accepted"`
- `quote_id` = ID of the freight quote
- `client_id` = ID of the associated client
- `service_id` = ID of the linked service
- `created_at` = Current timestamp (automatically set)

## Technical Implementation

### Database Function
```sql
CREATE OR REPLACE FUNCTION log_freight_quote_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log if client_decision changed to 'accepted'
  IF NEW.client_decision = 'accepted' AND (OLD.client_decision IS NULL OR OLD.client_decision != 'accepted') THEN
    -- Insert event log entry when a freight quote is accepted
    INSERT INTO events_log (
      event_type,
      client_id,
      service_id,
      quote_id,
      created_at
    ) VALUES (
      'quote_accepted',
      NEW.client,
      NEW.service_id,
      NEW.id,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;
```

### Database Trigger
```sql
CREATE TRIGGER trigger_log_freight_quote_accepted
  AFTER UPDATE ON freight_quotes
  FOR EACH ROW
  EXECUTE FUNCTION log_freight_quote_accepted();
```

## Key Features

1. **Automatic Logging**: The event is logged automatically without any manual intervention
2. **Change Detection**: Only logs when `client_decision` changes TO `'accepted'` (not if it was already accepted)
3. **Complete Data**: Captures all relevant IDs (quote, client, service) for analytics
4. **Timestamp**: Automatically records when the acceptance occurred

## Usage

To accept a quote and trigger this workflow:

```typescript
// Update the freight quote's client_decision field
await supabase
  .from('freight_quotes')
  .update({ client_decision: 'accepted' })
  .eq('id', quoteId);

// The trigger will automatically create an entry in events_log
```

## Analytics Integration

This workflow integrates with the KPI Dashboard (`kpi_dashboard.tsx`) where you can:
- View all quote acceptance events
- Track conversion rates from quotes to accepted quotes
- Analyze which services have the highest acceptance rates
- Monitor client engagement patterns

## Related Workflows

This workflow is part of a larger event logging system that includes:
- `quote_created` - When a new quote is created
- `service_quote_click` - When a user clicks to request a quote
- `quote_rejected` - When a client rejects a quote (to be implemented)
- `quote_paid` - When a quote is paid (to be implemented)

## Migration
- **Migration Name**: `create_quote_accepted_trigger`
- **Applied**: Successfully created and verified
- **Status**: Active and operational

## Testing

To test this workflow:

1. Create a freight quote or use an existing one
2. Update the `client_decision` field to `'accepted'`
3. Query the `events_log` table to verify the entry was created:

```sql
SELECT * FROM events_log 
WHERE event_type = 'quote_accepted' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Notes

- The trigger uses `SECURITY DEFINER` to ensure it has the necessary permissions to insert into `events_log`
- The trigger only fires on UPDATE operations, not INSERT
- The condition checks both that the new value is 'accepted' AND that the old value was different (to avoid duplicate logs)
- All foreign key relationships are maintained (client_id, service_id, quote_id)
