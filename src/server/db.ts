import { cache } from "react";
import "server-only";

const data = [
  {
    id: 1,
    user: 'User1',
    body: 'This is a comment.',
    likes: 0,
  },
  {
    id: 2,
    user: 'User2',
    body: 'This is another comment.',
    likes: 0,
  }
] as const;

export const getComments = cache(() => {
  // This could be loading from a database...
  return new Promise<typeof data>((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
});

export async function incrementLikeComment(id: number): Promise<number> {
  // Simulate incrementing the like count in a database
  const comment = data.find(c => c.id === id);
  if (comment) {
    comment.likes += 1;
    return comment.likes;
  }
  throw new Error('Comment not found');
}
