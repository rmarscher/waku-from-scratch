import { type ReactNode, use } from 'react';
import { fetchRsc } from 'waku/minimal/client';

let promise: Promise<Record<string, unknown>> | null = null;

export function Comments() {
  console.log("in client comments component");
  if (typeof window === 'undefined') {
    // This is supposed to work to fallback to the nearest suspense boundary
    // but it seems to not be caught.
    // throw new Error("Comments component must be used in a client context.");

    // However, it is not retrying with client rendering as expected
    return null;
  }

  // Simple cache to make sure we only fetch once.
  promise ??= fetchRsc('/comments');
  const elements = use(promise);
  return elements.Comments as ReactNode;
}
