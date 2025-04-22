# React Server Components from the ground up with Waku

React Server Components are a new type of component that renders ahead of time, on the server or at build time.

Parcel added support for React Server Components and has an excellent guide in their docs: https://parceljs.org/recipes/rsc/

This is an attempt at porting the Parcel guide to Waku. Waku supports file-based routing to create entry points for the application. It also has a "minimal API" that can be used without the built-in router.

## Install dependencies

```sh
npm install --save-exact waku react react-dom
```

**Note**: Waku requires `react` and `react-dom` v19.1.0 or later. It is recommended to use `npm create waku` to start a new project.

### Typescript

While the Parcel guide doesn't use typescript, Waku supports typescript "out of the box." We just need to create a tsconfig.json file with the following:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "downlevelIteration": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "jsx": "react-jsx"
  }
}
```

And install the React type packages:

```sh
npm install --save-exact --save-dev @types/react @types/react-dom
```

## Client rendering

React Server Components can be integrated into an existing client-rendered SPA. For example, instead of returning JSON from an API server for a new feature, you can render Server Components. This can help reduce client bundle sizes by sending only the components needed to render the requested data, and omitting heavy non-interactive components (e.g. Markdown renderers) from the client bundle entirely.

### Setup targets

Unlike Parcel, Waku automatically analyzes your code to determine the build targets. It will create a static client application if you do not add any dynamic server components.

Set the type to `"module"` and add the following scripts to your package.json:

```json
{
  "type": "module",
  "scripts": {
    "start": "waku",
    "dev": "waku dev",
    "build": "waku build"
  }
}
```

Waku will build both the client and server together.

### Create a server

Waku automatically creates a server using Hono. It will import a file located at `src/entries.tsx` that can export a default object with `handleRequest` and `handleBuild` functions.

`handleBuild` will be called during the build phase and `handleRequest` will be called on each dynamic request to the server.

Add this file at `src/entries.tsx`:

```tsx
import { unstable_defineEntries as defineEntries } from "waku/minimal/server";
import { unstable_createAsyncIterable as createAsyncIterable } from "waku/server";

export default defineEntries({
  handleRequest: async (input, _utils) => {
    if (input.type === 'custom' && input.pathname === '/') {
      return utils.renderHtml({}, <html><body><div>Hello World</div></body></html>, { rscPath: '' });
    }
    return null;
  },
  handleBuild: (_utils) => createAsyncIterable(async () => {
    // this can be used to output additional static html and RSC files at build time
    return [];
  }),
});
```

Also, create an empty file at `src/main.tsx`. This file is used to define the main client entry point. If it is omitted, then Waku will use a default client entry point. By creating an empty file, we will not execute any javascript on the client by default.

You can build and run the server now to test it:

```sh
npm run build
npm start
```

If you open http://localhost:8080/ in your browser, you should see our Hello World message. If you inspect the html source, there is a client javascript bundle that is loaded but it is empty. It is not needed to render the page. This minimal javascript comes from Vite's module loader client.

### Server entries

The handleRequest function is called for dynamic HTML requests, React Server Component requests and React Server Function requests.

`input.type === 'custom'` is used to identify dynamic HTML requests. The first param for the `renderHtml` utils function can be used to render additional React Server Components in parallel and stream them down with the HTML in the same response.

`input.type === 'component'` is used to identify React Server Component requests that are made directly from a React client.

Let's add a React Server Component to fetch and render comments from a database on the server.

Update `src/entries.tsx` to have the following contents:

```tsx
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
    console.log("handleRequest", input);
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
```

You can copy in the client and server files from the example app in this github repo - or simply clone this repo, run `npm install` and give it a try.

TODO: port more of the Parcel guide: Like button server function example.
