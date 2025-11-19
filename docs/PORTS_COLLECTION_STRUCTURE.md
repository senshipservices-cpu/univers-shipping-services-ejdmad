
# Ports Collection Structure

## Overview
The `ports` collection has been updated to serve as the foundation for the "Port Coverage" module of the Univers Shipping Services (3S Global) application.

## Database Schema

### Table: `ports`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | uuid | Yes | auto-generated | Primary key |
| `name` | text | Yes | - | Port name (e.g., "Port de Dakar") |
| `slug` | text | No | auto-generated | URL-friendly unique identifier, auto-generated from name |
| `country` | text | Yes | - | Country where the port is located |
| `city` | text | No | - | City where the port is located |
| `region` | enum | No | - | Geographic region (africa, europe, asia_me, americas, oceania) |
| `status` | enum | No | 'active' | Port status (active, inactive, draft) |
| `is_hub` | boolean | No | false | Indicates if the port is a major hub |
| `has_premium_agent` | boolean | No | false | Indicates if this port has a premium agent available |
| `latitude` | numeric | No | - | Latitude coordinate for map display |
| `longitude` | numeric | No | - | Longitude coordinate for map display |
| `description_fr` | text | No | - | French description of the port |
| `description_en` | text | No | - | English description of the port |
| `services_available` | array | No | - | Array of available services at this port |
| `created_at` | timestamptz | No | now() | Timestamp when the port was created |
| `updated_at` | timestamptz | No | now() | Timestamp when the port was last updated (auto-updated) |

## Enums

### `port_region`
- `africa` - African ports
- `europe` - European ports
- `asia_me` - Asian and Middle Eastern ports
- `americas` - American ports (North and South)
- `oceania` - Oceanian ports

### `port_status`
- `active` - Port is visible and active (default for new ports)
- `inactive` - Port is hidden/not operational
- `draft` - Port is in preparation

### `port_service`
- `consignation`
- `chartering`
- `customs`
- `logistics`
- `ship_supply`
- `crew_support`
- `warehousing`
- `door_to_door`

## Automatic Features

### 1. Slug Generation
- Automatically generated from the `name` field
- Converts to lowercase, removes special characters, replaces spaces with hyphens
- Ensures uniqueness by appending a random number if needed
- Updates automatically when the name changes

### 2. Updated At Timestamp
- The `updated_at` field is automatically updated whenever any field in the port record is modified
- No manual intervention required

### 3. Default Values
- New ports automatically get `status = 'active'`
- `is_hub` defaults to `false`
- `has_premium_agent` defaults to `false`
- `created_at` and `updated_at` are automatically set to the current timestamp

## Row Level Security (RLS)

The table has RLS enabled with the following policies:

1. **Public can view active ports** - Anyone can SELECT from the ports table
2. **Authenticated users can insert ports** - Logged-in users can add new ports
3. **Authenticated users can update ports** - Logged-in users can modify ports
4. **Authenticated users can delete ports** - Logged-in users can remove ports

## Usage Examples

### Creating a New Port

```typescript
import { supabase } from '@/app/integrations/supabase/client';

const { data, error } = await supabase
  .from('ports')
  .insert({
    name: 'Port de Dakar',
    country: 'Senegal',
    region: 'africa',
    is_hub: true,
    latitude: 14.6937,
    longitude: -17.4441,
    description_fr: 'Principal port du Sénégal',
    description_en: 'Main port of Senegal',
    has_premium_agent: true,
    // slug will be auto-generated as 'port-de-dakar'
    // status will default to 'active'
    // created_at and updated_at will be set automatically
  });
```

### Querying Active Ports by Region

```typescript
const { data: africanPorts, error } = await supabase
  .from('ports')
  .select('*')
  .eq('region', 'africa')
  .eq('status', 'active')
  .order('name', { ascending: true });
```

### Finding Ports with Premium Agents

```typescript
const { data: premiumPorts, error } = await supabase
  .from('ports')
  .select('*')
  .eq('has_premium_agent', true)
  .eq('status', 'active');
```

### Getting Port by Slug

```typescript
const { data: port, error } = await supabase
  .from('ports')
  .select('*')
  .eq('slug', 'port-de-dakar')
  .single();
```

## Migration Details

The migration `update_ports_collection_structure_v3` performed the following:

1. Enabled the `unaccent` extension for slug generation
2. Added `slug` column with unique constraint
3. Added `has_premium_agent` boolean column
4. Renamed `lat` to `latitude` and `lng` to `longitude`
5. Created new enum types with English values
6. Migrated existing data from French to English enum values
7. Made `country` field required (NOT NULL)
8. Created trigger function for automatic slug generation
9. Created trigger function for automatic `updated_at` timestamp
10. Added comprehensive comments to table and columns

## Integration with Other Tables

The `ports` table is referenced by:

- `global_agents.port` - Links agents to their ports
- `shipments.origin_port` and `shipments.destination_port` - Links shipments to ports
- `freight_quotes.origin_port` and `freight_quotes.destination_port` - Links quotes to ports
- `events_log.port_id` - Tracks events related to ports

## Next Steps

When adding new ports in future commands:

1. Always set `status = 'active'` (or rely on the default)
2. Include `latitude` and `longitude` for map display
3. Provide both `description_fr` and `description_en` for multilingual support
4. Set `is_hub = true` for major ports
5. Set `has_premium_agent = true` if a premium agent is available
6. The `slug` will be generated automatically from the `name`
7. Use the correct `region` enum value (africa, europe, asia_me, americas, oceania)

## TypeScript Types

The TypeScript types have been updated in `app/integrations/supabase/types.ts` to reflect the new structure. Use the following types:

```typescript
import { Tables, TablesInsert, TablesUpdate } from '@/app/integrations/supabase/types';

type Port = Tables<'ports'>;
type PortInsert = TablesInsert<'ports'>;
type PortUpdate = TablesUpdate<'ports'>;
```
