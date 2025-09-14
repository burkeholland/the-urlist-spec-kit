# API Contract – Lists & Entries

Base Path: `/api/lists`
All responses JSON. Errors use shape: `{ "error": { "code": string, "message": string } }`.
Authorization: Creator actions require `creator_session_id` httpOnly cookie; public reads no auth.

## Create Draft List
POST `/api/lists`
Request: (empty body)
Response 201:
```
{ "id": "uuid", "status": "draft", "createdAt": "iso", "entries": [] }
```
Errors: 500 (server)

## Get Draft List (creator)
GET `/api/lists/{id}`
Response 200:
```
{ "id": "uuid", "status": "draft|published", "slug": "string|null", "entries": [ {"id":"uuid","originalUrl":"...","title": "...","description":"...","fetchStatus":"pending|success|failed","position":0,"duplicate":false} ] }
```
Errors: 404 not found, 403 if creator mismatch

## Add URL Entry
POST `/api/lists/{id}/entries`
Body:
```
{ "url": "https://..." }
```
Response 201:
```
{ "id":"uuid","originalUrl":"...","title":null,"description":null,"fetchStatus":"pending","position":N,"duplicate":true|false }
```
Errors: 400 invalid URL, 403 creator mismatch, 404 list not found, 409 list published (immutable)

## Edit URL Entry
PATCH `/api/lists/{id}/entries/{entryId}`
Body (one or both):
```
{ "title": "string", "description": "string" }
```
Response 200: updated entry object
Errors: 400 validation, 403 mismatch, 404 not found, 409 published

## Delete URL Entry
DELETE `/api/lists/{id}/entries/{entryId}`
Response 204 (no body)
Errors: 403, 404, 409 published

## Delete List
DELETE `/api/lists/{id}`
Response 204
Errors: 403, 404

## Slug Availability Check
GET `/api/slug-availability?slug={slug}`
Response 200:
```
{ "slug": "candidate", "available": true|false }
```
Errors: 400 invalid format

## Assign Custom Slug (pre-publish)
POST `/api/lists/{id}/slug`
Body:
```
{ "slug": "custom-slug" }
```
Response 200: `{ "slug": "custom-slug", "available": true }`
Errors: 400 invalid, 403, 404, 409 conflict (already taken), 409 published

## Publish List
POST `/api/lists/{id}/publish`
Body: `{}`
Response 200:
```
{ "id":"uuid","slug":"final-slug","status":"published","publishedAt":"iso" }
```
Errors: 400 no entries, 403 mismatch, 404, 409 slug conflict, 409 already published

## Public View (by slug)
GET `/api/public/lists/{slug}`
Response 200:
```
{ "slug":"string","entries":[{"title":"...","description":"...","url":"https://..."}], "publishedAt":"iso" }
```
Errors: 404 not found

## Error Codes Reference
| Code | Meaning |
|------|---------|
| INVALID_URL | URL failed validation |
| INVALID_SLUG | Slug format invalid |
| SLUG_TAKEN | Slug already in use |
| LIST_NOT_FOUND | List/entry missing |
| FORBIDDEN | Creator mismatch |
| LIST_IMMUTABLE | Mutating published list |
| NO_ENTRIES | Publish attempted with zero entries |
| INTERNAL_ERROR | Unexpected server error |

## Notes
- Fetched metadata patch events will update entry objects asynchronously; client may poll or subscribe (future enhancement; initial scope poll on list refetch).
- Duplicate detection flag computed on insertion, not persisted separately (derived by comparing normalized URL set size vs count).
