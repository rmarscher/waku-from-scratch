"use server";

import { incrementLikeComment } from "./db";

export async function likeComment(id: number) {
  return await incrementLikeComment(Number(id));
}
