import { ListError, EntryError } from '@/lib/models/types';

export function mapListError(e: ListError): { status: number; body: any } {
  switch (e) {
    case 'not_found':
      return { status: 404, body: { error: 'not_found' } };
    case 'already_published':
    case 'immutable_after_publish':
      return { status: 409, body: { error: e } };
    case 'already_deleted':
      return { status: 410, body: { error: e } };
    case 'empty_list_cannot_publish':
      return { status: 400, body: { error: e } };
    case 'slug_conflict':
      return { status: 409, body: { error: e } };
    case 'invalid_slug':
      return { status: 422, body: { error: e } };
    default:
      return { status: 500, body: { error: 'internal' } };
  }
}

export function mapEntryError(e: EntryError): { status: number; body: any } {
  switch (e) {
    case 'not_found':
    case 'list_not_found':
      return { status: 404, body: { error: e } };
    case 'immutable_after_publish':
      return { status: 409, body: { error: e } };
    default:
      return { status: 500, body: { error: 'internal' } };
  }
}
