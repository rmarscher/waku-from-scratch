"use client";

import { useState, startTransition } from "react";
import { likeComment } from '../server/actions';

export function LikeButton({ id, likes = 0 }: { id: number; likes?: number }) {
  let [count, setCount] = useState(likes);
  let onClick = () => {
    console.log("like onClick called", id);
    startTransition(async () => {
      console.log("invoking server function");
      let newLikeCount = await likeComment(id);
      setCount(newLikeCount);
    });
  };

  return (
    <button onClick={onClick}>{count} likes</button>
  );
}
