
# Shipment Documents Module Implementation

## Overview

This document describes the implementation of Module 2 - Documents & fichiers (Shipment Documents) in the Digital Portal. This module allows clients to view and download documents associated with their shipments.

## Database Schema

### Table: `shipment_documents`

```sql
CREATE TABLE shipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Fields Description

- **id**: Unique identifier for the document
- **shipment**: Foreign key reference to the shipments table
- **file_path**: Path to the file in Supabase Storage
- **file_name**: Original name of the uploaded file
- **file_size**: Size of the file in bytes
- **mime_type**: MIME type of the file (e.g., application/pdf, image/jpeg)
- **type**: Document type/category (e.g., "Invoice", "Bill of Lading", "Customs Declaration")
- **uploaded_at**: Timestamp when the document was uploaded
- **uploaded_by**: User who uploaded the document (admin or system)
- **created_at**: Record creation timestamp
- **updated_at**: Record last update timestamp

## Storage Configuration

### Bucket: `shipment-documents`

- **Type**: Private bucket
- **Access**: Controlled via RLS policies
- **Purpose**: Store all shipment-related documents securely

## Row Level Security (RLS) Policies

### Database Table Policies

1. **Clients can view their shipment documents**
   - Allows authenticated clients to view documents for their own shipments
   - Joins with shipments and clients tables to verify ownership

2. **Admins can view all shipment documents**
   - Allows service role to view all documents
   - Used for admin operations

3. **Admins can insert shipment documents**
   - Allows service role and authenticated users to insert documents
   - Validates that the shipment exists

4. **Admins can update/delete shipment documents**
   - Allows service role to update and delete documents
   - Used for admin operations

### Storage Bucket Policies

1. **Clients can view their shipment documents in storage**
   - Allows authenticated clients to download files for their own shipments
   - Validates ownership through shipment_documents and shipments tables

2. **Admins can upload/update/delete documents in storage**
   - Allows authenticated users (admins) to manage files in the bucket
   - Service role has full access

## Features

### 1. Document Listing

- Documents are grouped by shipment
- Each group shows:
  - Shipment tracking number
  - Origin and destination ports
  - Number of documents
  - List of all documents with metadata

### 2. Document Display

Each document shows:
- File name
- Document type
- File size (in MB)
- Upload date
- Download button

### 3. Download Functionality

- Click the download button to download a document
- Shows loading indicator during download
- Creates a temporary download link
- Automatically triggers browser download
- Cleans up temporary resources after download

### 4. Empty States

- Shows appropriate message when no documents are available
- Provides context about when documents will appear

### 5. Loading States

- Shows spinner while loading documents
- Disables download button during download operation
- Provides visual feedback for all async operations

## UI Components

### Module Header
- Module number badge (2)
- Title: "Documents & Fichiers"
- Subtitle: "Accédez à tous vos documents d'expédition"

### Document Group Card
- Shipment tracking number with icon
- Document count badge
- Route information (origin → destination)
- List of documents

### Document Item
- File icon with colored background
- File name (truncated if too long)
- Metadata: type, size, upload date
- Download button with icon

## Implementation Details

### Data Loading

```typescript
// Load documents for client's shipments
const loadDocuments = useCallback(async () => {
  // 1. Get all shipment IDs for the client
  const { data: clientShipments } = await supabase
    .from('shipments')
    .select('id')
    .eq('client', client.id);

  // 2. Load all documents for these shipments
  const { data: documentsData } = await supabase
    .from('shipment_documents')
    .select('*')
    .in('shipment', shipmentIds)
    .order('uploaded_at', { ascending: false });

  // 3. Group documents by shipment
  const grouped = {};
  documentsData?.forEach((doc) => {
    if (!grouped[doc.shipment]) {
      grouped[doc.shipment] = [];
    }
    grouped[doc.shipment].push(doc);
  });
  
  setDocumentsGroupedByShipment(grouped);
}, [client]);
```

### Document Download

```typescript
const downloadDocument = useCallback(async (document: ShipmentDocument) => {
  // 1. Download file from Supabase Storage
  const { data, error } = await supabase.storage
    .from('shipment-documents')
    .download(document.file_path);

  // 2. Create temporary download link
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = document.file_name;
  
  // 3. Trigger download
  document.body.appendChild(link);
  link.click();
  
  // 4. Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}, []);
```

## Admin Operations

### Uploading Documents

Admins can upload documents through the admin panel or via API:

```typescript
// 1. Upload file to storage
const { data: fileData, error: uploadError } = await supabase.storage
  .from('shipment-documents')
  .upload(filePath, file);

// 2. Create database record
const { data: docData, error: docError } = await supabase
  .from('shipment_documents')
  .insert({
    shipment: shipmentId,
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    type: documentType,
    uploaded_by: adminUserId,
  });
```

## Security Considerations

1. **Access Control**
   - Clients can only view documents for their own shipments
   - All operations are validated through RLS policies
   - Storage access is controlled via bucket policies

2. **Data Validation**
   - File paths are validated before storage operations
   - Shipment ownership is verified before allowing access
   - User authentication is required for all operations

3. **File Security**
   - Files are stored in a private bucket
   - Download URLs are temporary and user-specific
   - No direct public access to files

## Future Enhancements

1. **Document Upload by Clients**
   - Allow clients to upload supporting documents
   - Add file type and size validation
   - Implement virus scanning

2. **Document Preview**
   - Add in-app preview for PDFs and images
   - Support for common document formats

3. **Document Search**
   - Search documents by name or type
   - Filter by date range
   - Advanced search capabilities

4. **Document Notifications**
   - Email notifications when new documents are uploaded
   - Push notifications for mobile apps

5. **Document Versioning**
   - Track document versions
   - Show document history
   - Allow reverting to previous versions

6. **Bulk Operations**
   - Download multiple documents as ZIP
   - Bulk delete for admins
   - Batch upload functionality

## Testing

### Test Scenarios

1. **View Documents**
   - Client with shipments and documents
   - Client with shipments but no documents
   - Client with no shipments

2. **Download Documents**
   - Download PDF document
   - Download image document
   - Download large file
   - Handle download errors

3. **Access Control**
   - Client trying to access another client's documents
   - Unauthenticated user trying to access documents
   - Admin accessing all documents

4. **Edge Cases**
   - Very long file names
   - Special characters in file names
   - Large number of documents per shipment
   - Network errors during download

## Troubleshooting

### Common Issues

1. **Documents not loading**
   - Check RLS policies are correctly configured
   - Verify client has shipments
   - Check database permissions

2. **Download fails**
   - Verify storage bucket policies
   - Check file exists in storage
   - Verify user has access to the shipment

3. **Performance issues**
   - Add indexes on frequently queried columns
   - Implement pagination for large document lists
   - Optimize queries to reduce joins

## Conclusion

The Shipment Documents module provides a secure and user-friendly way for clients to access their shipment documents. The implementation follows best practices for security, performance, and user experience, while maintaining flexibility for future enhancements.
