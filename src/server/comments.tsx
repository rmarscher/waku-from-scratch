import { LikeButton } from "../client/like-button";
import { getComments } from "./db";

async function renderMarkdown(markdown: string) {
  // Simulate rendering markdown to HTML
  return (
    <div className="markdown" dangerouslySetInnerHTML={{ __html: markdown }} />
  );
}

export async function Comments() {
  let comments = await getComments();

  return comments.map((comment) => (
    <article key={comment.id}>
      <p>Posted by: {comment.user}</p>
      {renderMarkdown(comment.body)}
      <LikeButton id={comment.id} likes={comment.likes} />
    </article>
  ));
}
