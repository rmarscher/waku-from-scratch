import { lazy, Suspense } from "react";

const Comments = lazy(() =>
  import("./comments").then((mod) => ({ default: mod.Comments }))
);
const ServerComments = lazy(() =>
  import("../server/comments").then((mod) => ({ default: mod.Comments }))
);

export function App({
  isSsr,
  isStatic,
}: {
  isSsr?: boolean;
  isStatic?: boolean;
}) {
  if (!isSsr) {
    return (
      <>
        <hr />
        <h2>Client-only rendering, no ssr</h2>
        <fieldset>
          <legend>These comments are loaded from the client:</legend>
          <Suspense fallback={<>Loading comments...</>}>
            <Comments />
          </Suspense>
        </fieldset>
      </>
    );
  }

  return (
    <html>
      <head />
      <body>
        <fieldset>
          <legend>
            These comments are{" "}
            {isStatic ? "rendered on " : "streamed down from "}
            the server:
          </legend>
          <Suspense fallback={<>Loading server comments...</>}>
            <ServerComments />
          </Suspense>
        </fieldset>
        <fieldset>
          <legend>These comments are intended to be loaded from the client:</legend>
          <Suspense fallback={<>Loading comments...</>}>
            <Comments />
            <div>...but it isn't working</div>
          </Suspense>
        </fieldset>
      </body>
    </html>
  );
}
