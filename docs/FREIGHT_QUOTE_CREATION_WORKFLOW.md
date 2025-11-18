
# Freight Quote Creation Workflow

## Overview
This document describes the automatic event logging workflow that triggers when a new freight quote is created in the system.

## Workflow Details

### Trigger
- **Event**: Creation of a new record in the `freight_quotes` table
- **Type**: Database trigger (AFTER INSERT)
- **Trigger Name**: `trigger_log_freight_quote_creation`

### Action
When a new freight quote is created, the system automatically:

1. Creates a new entry in the `events_log` table with the following data:
   - `event_type` = "quote_created"
   - `client_id` = `freight_quotes.client` (the client who requested the quote)
   - `service_id` = `freight_quotes.service_id` (the service for which the quote was requested)
   - `quote_id` = `freight_quotes.id` (the ID of the newly created quote)
   - `created_at` = current timestamp (NOW())

## Implementation

### Database Trigger Function
```sql
CREATE OR REPLACE FUNCTION log_freight_quote_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO events_log (
    event_type,
    client_id,
    service_id,
    quote_id,
    created_at
  ) VALUES (
    'quote_created',
    NEW.client,
    NEW.service_id,
    NEW.id,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger Definition
```sql
CREATE TRIGGER trigger_log_freight_quote_creation
  AFTER INSERT ON freight_quotes
  FOR EACH ROW
  EXECUTE FUNCTION log_freight_quote_creation();
```

## Benefits

1. **Automatic Tracking**: No manual intervention required - events are logged automatically
2. **Consistent Data**: Every freight quote creation is guaranteed to be logged
3. **Analytics Ready**: Data is immediately available for KPI dashboards and analytics
4. **Audit Trail**: Complete history of all quote creation events
5. **Performance**: Database-level triggers are highly efficient

## Usage

### Creating a Freight Quote
When you create a freight quote through the app (e.g., via the freight-quote form), the event is automatically logged:

```typescript
// In your app code
const { data, error } = await supabase
  .from('freight_quotes')
  .insert({
    client: clientId,
    service_id: serviceId,
    origin_port: originPortId,
    destination_port: destinationPortId,
    cargo_type: 'Container',
    volume_details: '1 x 20DC',
    // ... other fields
  });

// The trigger automatically creates an events_log entry
// No additional code needed!
```

### Querying Event Logs
To view all quote creation events:

```typescript
const { data: events } = await supabase
  .from('events_log')
  .select(`
    *,
    client:clients(*),
    service:services_global(*),
    quote:freight_quotes(*)
  `)
  .eq('event_type', 'quote_created')
  .order('created_at', { ascending: false });
```

## Related Workflows

This workflow is part of the comprehensive analytics system. Related workflows include:

- **service_quote_click**: Logged when a user clicks "Demander un devis" button
- **quote_accepted**: Logged when a client accepts a quote
- **quote_rejected**: Logged when a client rejects a quote
- **quote_paid**: Logged when a quote is paid

## KPI Dashboard Integration

The logged events are used in the KPI Dashboard (`app/(tabs)/kpi-dashboard.tsx`) to display:

- Total number of quotes created
- Quote creation trends over time
- Quotes by service type
- Quotes by client
- Conversion rates (from quote_created to quote_accepted)

## Testing

To test the workflow:

1. Create a new freight quote through the app
2. Check the `events_log` table for a new entry with `event_type = 'quote_created'`
3. Verify that the `client_id`, `service_id`, and `quote_id` are correctly populated

```sql
-- Test query
SELECT * FROM events_log 
WHERE event_type = 'quote_created' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Maintenance

### Viewing the Trigger
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_log_freight_quote_creation';
```

### Disabling the Trigger (if needed)
```sql
ALTER TABLE freight_quotes 
DISABLE TRIGGER trigger_log_freight_quote_creation;
```

### Enabling the Trigger
```sql
ALTER TABLE freight_quotes 
ENABLE TRIGGER trigger_log_freight_quote_creation;
```

### Dropping the Trigger (if needed)
```sql
DROP TRIGGER IF EXISTS trigger_log_freight_quote_creation ON freight_quotes;
DROP FUNCTION IF EXISTS log_freight_quote_creation();
```

## Security Considerations

- The trigger function uses `SECURITY DEFINER` to ensure it has the necessary permissions to insert into `events_log`
- RLS policies on `events_log` control who can view the logged events
- The trigger only logs metadata, not sensitive quote details

## Performance Impact

- Minimal: The trigger adds a single INSERT operation per freight quote creation
- The `events_log` table should have appropriate indexes on frequently queried columns
- Consider partitioning `events_log` if it grows very large (millions of records)

## Future Enhancements

Potential improvements to this workflow:

1. Add user_id tracking (if available in the context)
2. Log additional metadata in the `details` field
3. Send notifications when quotes are created
4. Integrate with external analytics platforms
5. Add rate limiting or anomaly detection

## Related Documentation

- [Analytics & KPI System](./ANALYTICS_KPI_SYSTEM.md)
- [Workflow Implementation Summary](./WORKFLOW_IMPLEMENTATION_SUMMARY.md)
- [KPI Dashboard Implementation](./ANALYTICS_KPI_SYSTEM.md)
