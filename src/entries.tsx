import { lazy, Suspense } from "react";
import { Slot } from "waku/minimal/client";
import { unstable_defineEntries as defineEntries } from "waku/minimal/server";
import { unstable_createAsyncIterable as createAsyncIterable } from "waku/server";

const App = lazy(() =>
  import("./client/app").then((mod) => ({ default: mod.App }))
);
const Comments = lazy(() =>
  import("./server/comments").then((mod) => ({ default: mod.Comments }))
);

export default defineEntries({
  handleRequest: async (input, utils) => {
    if (input.type === "custom" && input.pathname === "/favicon.ico") {
      return null;
    }
    console.log("handleRequest", input);
    if (input.type === "function") {
      const value = await input.fn(...input.args);
      return utils.renderRsc({ _value: value });
    }
    if (input.type === "component" && input.rscPath === "/comments") {
      // Handle requests from the ./src/client/comments.tsx Comments component
      return utils.renderRsc({ Comments: <Comments /> });
    }
    if (input.type === "custom") {
      const res = utils.renderHtml(
        {
          App: <App isSsr={true} isStatic={input.pathname === "/static"} />,
        },
        <Slot id="App" />,
        { rscPath: "" }
      );
      // Async component data will stream down in the response when it becomes available.
      if (input.pathname === "/static") {
        // If we await the allReady promise, we can ensure that the HTML is fully rendered on the server
        // before the response is sent to the client.
        await (
          await res
        ).body.allReady;
        console.log("Static HTML response ready");
      }
      return res;
    }
  },
  handleBuild: (_utils) =>
    createAsyncIterable(async () => {
      return [];
    }),
});
