# Ingestion Guide

This document outlines the ingestion flows available in the application for adding content to heaps. The ingestion system follows a modular pattern where each ingestion type has its own dedicated route under `/api/heaps/[heapId]/injest/`.

## Overview

All ingestion routes follow a consistent pattern:
- **Authentication**: All routes require authenticated users (Supabase Auth)
- **Upstream Processing**: Content is forwarded to an n8n webhook pipeline for processing
- **Standard Fields**: All ingestion requests include `heap_id`, `user_id`, `file_id`, and optional metadata (tags, folders)

## Architecture

### Ingestion Flow

```
User Action
    ↓
API Route Handler
    ↓
Authentication Check
    ↓
Content Processing
    ↓
FormData Creation
    ↓
Upstream n8n Webhook
    ↓
Response to Client
```

### Upstream Endpoint

All ingestion routes send data to:
```
https://n8n-workflows-production-d083.up.railway.app/webhook/ingest-pipeline
```

## Current Ingestion Routes

### 1. File Upload (`/api/heaps/[heapId]/injest/upload`)

The file upload route allows users to upload files directly through a form.

**Endpoint:** `POST /api/heaps/[heapId]/injest/upload`

**Request Format:**
- Content-Type: `multipart/form-data`
- Body: `FormData` with the following fields:
  - `file` (required): The file to upload
  - `file_tags` (optional): JSON stringified array of tag slugs
  - `file_folders` (optional): JSON stringified array of folder paths

**Supported File Types:**
- Text: `.txt`, `.md`, `.json`, `.csv`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.webp`
- Documents: `.pdf`

**Response:**
```json
{
  "ok": true,
  "data": { ... } // Response from upstream pipeline
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": { ... } // Additional error details
}
```

**Default Folders:**
- `["uploads", "library"]`

**Usage Example:**
```typescript
const formData = new FormData();
formData.set("file", file);
formData.set("file_tags", JSON.stringify(["tag-slug-1", "tag-slug-2"]));

const response = await fetch(`/api/heaps/${heapId}/injest/upload`, {
  method: "POST",
  body: formData,
});
```

---

### 2. Markdown Ingestion (`/api/heaps/[heapId]/injest/markdown`)

The markdown ingestion route allows users to ingest markdown content as files. The markdown text is converted to a File object before being sent to the upstream pipeline.

**Endpoint:** `POST /api/heaps/[heapId]/injest/markdown`

**Request Format:**
- Content-Type: `application/json`
- Body:
```json
{
  "markdown": "string (required)",
  "file_name": "string (optional)",
  "file_tags": ["string"] (optional),
  "file_folders": ["string"] (optional)
}
```

**Parameters:**
- `markdown` (required): The markdown content to ingest
- `file_name` (optional): Custom filename. If not provided, defaults to `markdown-{timestamp}.md`. Automatically appends `.md` if missing.
- `file_tags` (optional): Array of tag slugs to associate with the file
- `file_folders` (optional): Array of folder paths. Defaults to `["uploads", "library", "notes"]` if not provided

**Response:**
```json
{
  "ok": true,
  "data": { ... } // Response from upstream pipeline
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": { ... }
}
```

**Default Folders:**
- `["uploads", "library", "notes"]`

**Usage Example:**
```typescript
const response = await fetch(`/api/heaps/${heapId}/injest/markdown`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    markdown: "# My Notes\n\nSome content here...",
    file_name: "my-notes.md",
    file_tags: ["notes", "personal"],
  }),
});
```

---

## Standard FormData Fields

All ingestion routes send the following fields to the upstream webhook:

### Required Fields
- `file`: The file content (File object)
- `file_id`: UUID generated for the file
- `file_name`: The filename
- `file_mime`: MIME type of the file
- `file_mime_type`: Duplicate of `file_mime` (for upstream compatibility)
- `file_ext`: File extension
- `heap_id`: The heap ID
- `user_id`: The authenticated user's ID

### Optional Fields
- `file_tags`: JSON stringified array of tag slugs (defaults to empty array)
- `file_folders`: JSON stringified array of folder paths (varies by route)

---

## Future Ingestion Routes

The following routes are planned for future implementation:


### 3. URL/Web Page Ingestion

**Proposed Endpoint:** `POST /api/heaps/[heapId]/injest/url`

**Purpose:** Ingest content from web URLs by fetching and processing the content.

**Proposed Request Format:**
```json
{
  "url": "string (required)",
  "file_name": "string (optional)",
  "file_tags": ["string"] (optional),
  "file_folders": ["string"] (optional),
  "extract_mode": "full|summary|text-only" (optional)
}
```

**Use Cases:**
- Save web articles for later reference
- Import documentation from external sources
- Archive web content
- Research and knowledge gathering

**Considerations:**
- Web scraping vs. API access
- Content extraction (article text, metadata)
- Rate limiting to prevent abuse
- Handling dynamic/JavaScript-rendered content
- Respecting robots.txt and rate limits
- PDF generation from web pages (optional)

---

### 4. OAuth Cloud Storage Ingestion

**Proposed Endpoint:** `POST /api/heaps/[heapId]/injest/cloud`

**Purpose:** Ingest files from OAuth-connected cloud storage services (Google Drive, Dropbox, OneDrive, etc.). Users authenticate via OAuth and can select specific documents to ingest.

**Proposed Request Format:**
```json
{
  "service": "google-drive|dropbox|onedrive|box|etc",
  "file_ids": ["string"] (required),
  "file_tags": ["string"] (optional),
  "file_folders": ["string"] (optional)
}
```

**Authentication Flow:**
1. User initiates OAuth connection via separate endpoint: `POST /api/heaps/[heapId]/connections/{service}/auth`
2. User is redirected to service's OAuth consent screen
3. Access token stored securely (encrypted in database, associated with user/heap)
4. User browses/selects files via: `GET /api/heaps/[heapId]/connections/{service}/files`
5. User submits selected files for ingestion

**Proposed Connection Management Endpoints:**
- `POST /api/heaps/[heapId]/connections/{service}/auth` - Initiate OAuth flow
- `GET /api/heaps/[heapId]/connections/{service}/callback` - OAuth callback handler
- `GET /api/heaps/[heapId]/connections/{service}/files` - List available files/folders
- `DELETE /api/heaps/[heapId]/connections/{service}` - Disconnect service

**Use Cases:**
- Import documents from Google Drive
- Sync files from Dropbox
- Import OneDrive documents
- Bulk import from personal cloud storage
- Selective document ingestion
- Regular sync jobs (future enhancement)

**Considerations:**
- **OAuth Token Storage**: Store encrypted refresh tokens securely, associated with user/heap
- **Service Provider Patterns**: Create unified interface for different providers
- **Token Refresh**: Handle automatic token refresh for long-lived connections
- **File Selection UI**: Frontend component for browsing and selecting files
- **File Metadata**: Preserve original file metadata (created date, owner, etc.)
- **Large File Handling**: Stream large files, support chunked downloads
- **Rate Limiting**: Respect provider rate limits (Google Drive, Dropbox, etc.)
- **Scope Management**: Request appropriate OAuth scopes (read-only for ingestion)
- **Connection Status**: Track and display connection health/status
- **Multi-Select**: Support selecting multiple files in single ingestion request
- **Folder Browsing**: Allow users to browse folder structure
- **File Types**: Support native file types (Google Docs, Sheets, etc.) with conversion to markdown/PDF
- **Incremental Sync**: Future enhancement for automatic periodic sync

**Supported Services (Planned):**
1. **Google Drive** (priority)
   - OAuth 2.0 with refresh tokens
   - Google Docs, Sheets, Slides conversion
   - Folder browsing and search
2. **Dropbox**
   - OAuth 2.0
   - File versioning support
3. **Microsoft OneDrive**
   - Microsoft Graph API
   - Office 365 document support
4. **Box**
   - OAuth 2.0
   - Enterprise features
5. **Others** (future)
   - Notion, Confluence, etc.

**Service-Specific Considerations:**

**Google Drive:**
- Convert Google Docs/Sheets/Slides to markdown or PDF
- Handle Google Workspace permissions
- Support shared drives
- Export formats: PDF, markdown, HTML

**Dropbox:**
- Handle shared folders
- File version history (optional)
- Paper document conversion

**OneDrive:**
- Office 365 integration
- SharePoint support
- Excel, Word, PowerPoint conversion

---

### 5. Email Ingestion

**Proposed Endpoint:** `POST /api/heaps/[heapId]/injest/email`

**Purpose:** Ingest email content via IMAP or email forwarding webhook.

**Proposed Request Format:**
```json
{
  "email_source": "imap|webhook",
  "connection_config": { ... }, // IMAP credentials or webhook data
  "file_tags": ["string"] (optional),
  "file_folders": ["string"] (optional)
}
```

**Use Cases:**
- Email forwarding to heap
- IMAP integration for automated email capture
- Meeting notes and email threads
- Support ticket ingestion

**Considerations:**
- Secure credential storage (OAuth preferred)
- Email parsing (HTML to markdown)
- Attachment handling
- Threading and conversation grouping
- Spam filtering

---

### 5. API Ingestion

**Proposed Endpoint:** `POST /api/heaps/[heapId]/injest/api`

**Purpose:** Ingest structured data from external APIs (REST, GraphQL, etc.).

**Proposed Request Format:**
```json
{
  "api_endpoint": "string (required)",
  "api_config": {
    "method": "GET|POST|...",
    "headers": { ... },
    "auth": { ... },
    "body": { ... }
  },
  "transformation": "raw|markdown|json" (optional),
  "file_tags": ["string"] (optional),
  "file_folders": ["string"] (optional)
}
```

**Use Cases:**
- Periodic sync from external APIs
- Documentation API ingestion
- Database exports
- Automated content aggregation

**Considerations:**
- Authentication mechanisms (API keys, OAuth)
- Rate limiting and backoff strategies
- Response transformation and normalization
- Scheduled/automated ingestion
- Webhook support for real-time ingestion

---

### 6. Text Block Ingestion

**Proposed Endpoint:** `POST /api/heaps/[heapId]/injest/text`

**Purpose:** Ingest plain text content (similar to markdown but without markdown formatting).

**Proposed Request Format:**
```json
{
  "text": "string (required)",
  "file_name": "string (optional)",
  "file_tags": ["string"] (optional),
  "file_folders": ["string"] (optional)
}
```

**Use Cases:**
- Quick note capture
- Plain text import
- Code snippet ingestion
- Simple text content without markdown overhead

**Considerations:**
- Similar to markdown route but different file extension
- Default folder could be `["uploads", "library", "text"]`
- Automatic formatting detection (could convert to markdown)

---

### 7. RSS/Feed Ingestion

**Proposed Endpoint:** `POST /api/heaps/[heapId]/injest/feed`

**Purpose:** Ingest content from RSS/Atom feeds, with support for periodic polling.

**Proposed Request Format:**
```json
{
  "feed_url": "string (required)",
  "poll_interval": "number (optional)", // minutes
  "file_tags": ["string"] (optional),
  "file_folders": ["string"] (optional)
}
```

**Use Cases:**
- Blog post aggregation
- News feed monitoring
- Documentation feed ingestion
- Content discovery and curation

**Considerations:**
- Feed parsing (RSS, Atom, JSON Feed)
- Duplicate detection
- Scheduled polling vs. webhook
- Article extraction from feed links
- Metadata preservation (author, published date, etc.)

---

## Implementation Guidelines

When implementing new ingestion routes, follow these patterns:

1. **Route Structure**: Create routes at `/api/heaps/[heapId]/injest/{type}/route.ts`

2. **Authentication**: Always check authentication using:
   ```typescript
   const supabase = await createClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError || !user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```

3. **FormData Creation**: Convert your content to a File object and create FormData with standard fields:
   ```typescript
   const formData = new FormData();
   formData.set("file", file);
   formData.set("file_id", crypto.randomUUID());
   formData.set("file_name", fileName);
   // ... other standard fields
   ```

4. **Error Handling**: Follow the error handling pattern used in existing routes:
   - Parse upstream response
   - Extract error messages
   - Return appropriate status codes

5. **Default Folders**: Set appropriate default folders based on content type

6. **Tag Support**: Always support optional `file_tags` parameter

7. **Response Format**: Return consistent response format:
   ```typescript
   return NextResponse.json(
     { ok: true, data: parsedBody ?? null },
     { status: upstreamResponse.status }
   );
   ```

## Testing

When adding new ingestion routes:

1. Test authentication requirements
2. Test with valid and invalid inputs
3. Test error handling for upstream failures
4. Test optional parameters (tags, folders)
5. Verify files appear in the heap after ingestion

