/**
 * Creates a reasonably unique id for a new record (e.g. "lq3k9x2a-7f3b9c").
 * Good enough for on-device data; the database will assign UUIDs later.
 */
export function newId(): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${time}-${random}`;
}
