# Feature Specification: The Urlist – Create & Share URL Collections

**Feature Branch**: `001-design-web-application`  
**Created**: 2025-09-13  
**Status**: Draft  
**Input**: User description: "Design web application The Urlist allowing users to create and share collections of URLs: create empty list, add URL entries (with fetched title/description), edit/delete entries, delete list, assign unique list URL (user-chosen or system-generated slug), publish list to make it publicly viewable and shareable, public viewers can see list contents."

## Execution Flow (main)
```
1. Parse user description from Input
	→ If empty: ERROR "No feature description provided"
2. Extract key concepts from description
	→ Identify: actors (creator, viewer), actions (create list, add/edit/delete URL, publish, view), data (list, URL entries, metadata, slug), constraints (unique URL)
3. For each unclear aspect:
	→ Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
	→ If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
	→ Each requirement must be testable
	→ Mark ambiguous requirements
6. Identify Key Entities (data involved)
7. Run Review Checklist
	→ If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
	→ If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., authentication), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas** (many apply here and are marked):
	- User types and permissions
	- Data retention/deletion policies  
	- Performance targets and scale
	- Error handling behaviors
	- Integration requirements
	- Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
An individual (list creator) wants to assemble a collection of useful links on a topic and share it with others via a single, friendly URL. They create an empty list, add URLs (which are automatically enriched with title and description when possible), optionally refine or remove entries, and when satisfied, publish the list to make it publicly viewable at its unique URL so recipients can browse the curated collection without needing an account (viewer role).

### Acceptance Scenarios
1. **Given** a user on the application wanting to start a collection, **When** they choose to create a new list, **Then** an empty list with a placeholder name and draft status is created and visible to them for editing.
2. **Given** a draft list is open, **When** the user pastes a valid URL and confirms add, **Then** the URL entry is added to the list and (if retrievable) a title and description appear within a short period or placeholders are shown until retrieval completes.
3. **Given** a URL entry exists in a draft list, **When** the user chooses to edit the entry's title or description, **Then** the modified values are updated and shown immediately.
4. **Given** multiple URL entries exist, **When** the user deletes one, **Then** that entry is removed from the displayed list.
5. **Given** a draft list with at least one entry, **When** the user publishes the list, **Then** the list becomes publicly accessible at its unique URL.
6. **Given** a published list URL, **When** an unauthenticated visitor accesses it, **Then** they can view all list entries (titles, descriptions, original URLs) in read-only form.
7. **Given** a draft list, **When** the user requests a custom slug and it is available, **Then** the list's public URL updates to use that slug.
8. **Given** a draft list, **When** the user attempts to set a slug already used by another list, **Then** they are informed the slug is unavailable and prompted to choose another.
9. **Given** a list (draft or published), **When** the user deletes the entire list, **Then** all its entries are no longer publicly viewable and the list URL returns an appropriate not-found indication.
10. **Given** a URL failing metadata fetch, **When** it remains unresolved after the defined timeout, **Then** the entry persists with at least the raw URL and a fallback label.

### Edge Cases
- Duplicate URL additions: Allowed; system issues a non-blocking warning and preserves duplicates.
- Very long URL: Inputs longer than 2000 characters rejected with validation error; up to 2000 characters stored fully (no data truncation in storage; UI may visually truncate).
- Metadata fetch failure (network, unsupported content type) triggers fallback after timeout.
- Slug collision (including concurrent attempts) resolved atomically; user sees immediate unavailability notice.
- Deleting a list currently being viewed publicly causes subsequent fetches to return not-found.
- Rapid add/remove operations must not corrupt insertion order.
- Empty list publication is disallowed; at least one URL entry required to publish.
- Only two states exist (draft, published); no unlisted or private intermediate states in this release.

## Assumptions & Clarification Resolutions
The following assumptions resolve all previously marked uncertainties; they are now part of the feature scope and are testable.

1. Duplicate URLs: Duplicates are permitted within a list. System displays a non-blocking warning when a URL identical (case-insensitive after normalization) already exists. No automatic deduplication.
2. URL Length: Maximum accepted URL length is 2000 characters. Longer inputs are rejected with a validation error message; no silent truncation.
3. Empty Publication: A list must contain at least one URL entry before it can be published.
4. List States: Only 'draft' and 'published' states exist. No unlisted/private states in initial scope.
5. Reordering: Manual reordering is out of scope for this release; insertion order is authoritative.
6. Creator Identification: Creator actions are authorized via an opaque session-bound identifier established at first list creation. Formal user accounts / authentication flows are out of scope.
7. Metadata Fetch Timeout: Each URL metadata enrichment attempt times out after 5 seconds; upon timeout the entry is marked failed and fallback title/description shown.
8. Slug Validation Performance: Slug uniqueness validation must complete within 1 second at the 95th percentile under normal load (≤10 concurrent validations). Publication is blocked until validation completes.
9. Duplicate URL Feedback: System warns (see #1) but does not block adding duplicates.
10. Logging & Retention: Publish and delete actions are logged with timestamp and list identifier; logs retained 90 days for auditing, then purged. No additional compliance requirements in scope.
11. Publication Immutability: After publication, a list becomes read-only (except deletion). Unpublish or republish flows are not supported; edits require working on the draft before publish or creating a new list in future enhancements.
12. Viewer Differentiation: All public viewers are treated the same (anonymous); no distinction between authenticated vs unauthenticated viewers.

These assumptions have been integrated into the Functional Requirements where applicable.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST allow a user to create a new empty list in draft status.
- **FR-002**: System MUST allow the list creator to add a URL to a draft list via an input field.
- **FR-003**: System MUST attempt to enrich each added URL with a title and description (retrieved from the target resource) asynchronously.
- **FR-004**: System MUST display each URL entry with (a) original URL, (b) title (fetched or placeholder), (c) description (fetched or placeholder).
- **FR-005**: System MUST allow the creator to edit the title and description of any URL entry in the draft list.
- **FR-006**: System MUST allow the creator to delete an individual URL entry from the draft list.
- **FR-007**: System MUST allow the creator to delete the entire list (draft or published) resulting in public inaccessibility.
- **FR-008**: System MUST provide a unique public URL (slug) for each list upon publication.
- **FR-009**: System MUST allow the creator to request a custom slug prior to publication, validating uniqueness case-insensitively.
- **FR-010**: System MUST automatically generate a slug if the user does not specify one.
- **FR-011**: System MUST prevent assignment of a slug already in use by another active list.
- **FR-012**: System MUST allow the creator to publish a draft list, changing its status to public and making it viewable by any visitor with the URL.
- **FR-013**: System MUST allow public (unauthenticated) visitors to view published lists in read-only form.
- **FR-014**: System MUST show a not-found indication when a deleted or non-existent list URL is accessed.
- **FR-015**: System MUST handle metadata fetch failures by retaining the entry with the original URL and a fallback title/description (e.g., "(No title)" / "(No description)").
- **FR-016**: System MUST reflect enrichment updates (title/description) in the list view without requiring a manual refresh once fetched.
// Functional requirements updated per resolved assumptions
- **FR-017**: System MUST maintain insertion order of URL entries; manual reordering is explicitly out of scope for this release.
- **FR-018**: System MUST restrict editing (add/edit/delete entries, change slug, publish, delete list) to the list creator identified by an opaque session-bound creator identifier.
- **FR-019**: System MUST validate input URLs for syntactic correctness before adding.
// Enrichment and slug validation constraints
- **FR-020**: System MUST indicate enrichment in-progress state (e.g., loading) until metadata retrieval completes or a 5-second timeout elapses (timeout => fallback applied).
- **FR-021**: System MUST prevent publication if slug uniqueness validation has not completed and MUST achieve slug validation completion within 1 second p95 under normal load.
- **FR-022**: System MUST prevent editing of entries by public viewers.
- **FR-023**: System MUST support deleting a list even after publication, removing public access.
// Duplicate handling and logging policies
- **FR-024**: System SHOULD provide non-blocking feedback when a duplicate URL is added (duplicates allowed, flagged for user awareness).
- **FR-025**: System MUST log publish and delete actions (timestamp, list identifier) and retain these logs for 90 days.
- **FR-026**: System MUST return an appropriate error message when adding an invalid URL.
- **FR-027**: System MUST allow draft modification after initial creation until published; once published the list becomes immutable except for deletion (no unpublish/republish flow).
- **FR-028**: System MUST ensure public view never exposes list management controls.

All prior ambiguities have been resolved via the Assumptions & Clarification Resolutions section; no outstanding clarification markers remain.

### Key Entities *(include if feature involves data)*
- **List**: A curated collection of URL entries. Attributes: identifier, slug (unique when published), status (draft, published), creation timestamp, owner reference. Relationships: has many URL Entries.
- **URL Entry**: Represents a single URL within a list. Attributes: identifier, original URL, title (fetched or user edited), description (fetched or user edited), fetch status, added timestamp, position index.
- **Slug**: Human-readable unique identifier for a published list. Attributes: slug string, associated list reference, availability state. (Conceptual, may be part of List domain data.)
- **User (Creator)**: The person who creates and manages a list. Attributes: identifier (opaque session-bound creator ID). User account system out of scope.
- **Viewer**: Any public visitor accessing a published list (all treated uniformly; no viewer role differentiation this release).
- **Metadata Fetch Task**: Asynchronous process retrieving title and description for a URL entry. Attributes: status (pending, success, failed), completion timestamp, error reason.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed (clarifications resolved)

---

