# generator-g-next

**GeNYG** (Getapper NextJS Yeoman Generator) is a [Yeoman](https://yeoman.io/) generator for scaffolding, developing, testing, and deploying **Next.js** applications. It provides composable sub-generators for pages, APIs, SPAs, forms, databases, AWS schedulers, and authentication, so you can bootstrap and extend a Next.js project in a consistent way.

**Package:** published as **`@thegrinch00/generator-g-next`** on npm.

**Commands:** use the **`g-next`** CLI (recommended):

- **`g-next <name>`** — e.g. `g-next version`, `g-next app`, `g-next pkg-core`, `g-next page`
- Run **`g-next --help`** for all subcommands.

You can also run Yeoman directly: **`yo @thegrinch00/g-next:<name>`** (use `g-next`, not `generator-g-next`, in the namespace).

The tables below list generators by **name** only (use that name with `g-next <name>`).

---

## Purpose of this repository

This repository is the **Getapper NextJS Yeoman Generator**. It:

- **Bootstraps** new Next.js apps with a fixed stack (Next 16 App Router, TypeScript, ESLint, `src` layout, no Tailwind).
- **Adds optional packages** (core tooling, MUI, Redux/SPA, i18n, MongoDB, PostgreSQL, cookie auth) via `pkg-*` generators.
- **Scaffolds features** (App Router pages, API routes, components, forms, Redux slices, SPAs, models, tasks) so file layout and patterns stay consistent.
- **Integrates with AWS** (EventBridge, Scheduler, IAM) to create and manage scheduled API invocations.

Most feature generators depend on having run the right `pkg-*` first; the generator will tell you if a required package is missing.

**Requirements:** Node.js ≥22. The generator uses ES modules (`"type": "module"`).

---

## Getting started

1. **Install the generator and Yeoman** (global or via npx):

   ```bash
   npm install -g yo @thegrinch00/generator-g-next
   ```

   This installs the **`g-next`** CLI as well.

2. **Create and enter a new project folder** (e.g. clone an empty repo or `mkdir my-app && cd my-app`).

3. **Bootstrap the app** with:

   ```bash
   g-next app
   ```

4. **Install the core package** with `g-next pkg-core` (recommended right after the app).

5. **Add optional packages** (e.g. `g-next pkg-mui`, `g-next pkg-spa`) and then use the feature generators (`g-next page`, `g-next api`, `g-next comp`, `g-next form`, `g-next slice`, etc.).

**Examples:** `g-next version`, `g-next app`, `g-next pkg-core`, `g-next page`, `g-next api`. Run `g-next --help` for the full subcommand list.

---

## Testing locally (before publishing)

To try the package from this repo without publishing to npm:

1. **Install Yeoman globally** (if you don’t have it):  
   `npm install -g yo`

2. **Install this package globally from the repo root** (simplest):

   ```bash
   cd /path/to/generator-g-next
   npm install -g .
   ```

   That installs the package and makes the **`g-next`** command available.

3. **Test the CLI** from any directory:

   ```bash
   g-next --help
   g-next -v
   g-next version
   ```

4. **Test a generator** (e.g. in an empty folder):

   ```bash
   mkdir /tmp/my-test-app && cd /tmp/my-test-app
   g-next app
   ```

5. **When done testing**, uninstall the global package:

   ```bash
   npm uninstall -g @thegrinch00/generator-g-next
   ```

**Alternative:** use **`npm link`** from the repo root instead of `npm install -g .` to symlink the package; uninstall with `npm uninstall -g @thegrinch00/generator-g-next` when finished.

---

## Generators overview

### Bootstrap

| Command    | Purpose                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app`      | Creates the Next.js app in the current directory via `create-next-app@16` with **App Router**, TypeScript, npm, ESLint, `src` dir, no Tailwind, no Turbopack. Run in an empty project folder.                                                                                                                                                         |
| `pkg-core` | **Requires:** fresh Next.js app. Installs GeNYG “core”: ESLint + Prettier, Husky + lint-staged, Jest, env handling, **zod**, `.genyg.json`, AppHead, response-handler, **react-query** lib, and test utils. Adds `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_WEBSITE_BASE_URL` to Next env config. **Run once after `app`.** Node engine: ≥22 &lt;23. |

---

### Packages (run once per project)

These add dependencies and shared code; many other generators depend on them.

| Command            | Depends on | Purpose                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pkg-core`         | —          | Core tooling and GeNYG config (see above).                                                                                                                                                                                                                                                                                               |
| `pkg-mui`          | pkg-core   | **MUI 7**, TanStack React Form, **TipTap** (rich text), dayjs, react-color, react-number-format, react-dropzone; form primitives (`_form` with FieldErrors, `_input`: FormTextField, FormSelect, FormCheckbox, FormDatePicker, FormNumericFormat, FormRichTextField, FormColorPicker), AppButton, AppSnackbar, themes, useConfirmDialog. |
| `pkg-spa`          | pkg-core   | **Redux Toolkit 2**, Redux Saga, redux-persist, **react-router-dom 7**, **TanStack React Query**, axios, qs. Base for building SPAs inside Next.js.                                                                                                                                                                                      |
| `pkg-translations` | pkg-mui    | i18next + react-i18next; translation folders (en/it/fake), types, LanguageMenu, TranslatedRoute, useInitializeTranslations, useTypedTranslations; extends Next config with i18n options.                                                                                                                                                 |
| `pkg-mongodb`      | pkg-core   | MongoDB driver; lib for connection and DAO; env vars (MONGODB_URI, MONGODB_NAME).                                                                                                                                                                                                                                                        |
| `pkg-postgresql`   | pkg-core   | **PostgreSQL (Neon)** via `@neondatabase/serverless` and **Drizzle ORM**; `src/db/` with schema, custom columns (date/timestamp), sample `user` table; `DATABASE_URL` in env and Next config.                                                                                                                                            |
| `pkg-cookie-auth`  | pkg-core   | Cookie-based auth with **iron-session 8**; test session helpers. Registers in `.genyg.json`; use with `cookie-auth-role` to add roles.                                                                                                                                                                                                   |

---

### Pages and UI (App Router)

| Command | Depends on | Purpose                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page`  | pkg-core   | New **App Router** route under `src/app/`. You pick the parent folder (e.g. via file selector), then the **segment** (e.g. `admin`, `users`, `[slug]`, `[...parts]`, `[[...parts]]`). Optionally generates `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`; supports “use client” for the page. |
| `comp`  | pkg-core   | New React component + hooks file under `src/components/` (folder chosen via file selector).                                                                                                                                                                                                                           |
| `form`  | pkg-mui    | New form component with FormProvider and validation under `src/components/` (folder chosen via file selector).                                                                                                                                                                                                        |

---

### API and backend

| Command         | Depends on  | Purpose                                                                                                                                                                                                                       |
| --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api`           | pkg-core    | New API endpoint: handler, interfaces, validations, test, and wiring under `src/endpoints/` plus the corresponding route under `src/pages/api/`. Optional cookie-auth role when pkg-cookie-auth is installed and roles exist. |
| `model`         | pkg-core    | New model file in `src/models/client`, `server`, or `common` (for React-only, Node-only, or shared code).                                                                                                                     |
| `model-mongodb` | pkg-mongodb | New server-side MongoDB model under `src/models/server/` using the project’s MongoDB template (collection name derived from model name).                                                                                      |
| `task`          | pkg-core    | New task under `src/tasks/` with `index.ts` and `exec.ts`, plus a `TASK:<TaskName>` script in package.json (**tsx** with path mapping). Optional MongoDB usage in templates.                                                  |

---

### Single Page Applications (SPA)

| Command | Depends on | Purpose                                                                                                                                                                                                                                                                                             |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spa`   | pkg-spa    | New SPA: a **App Router** page under `src/app/` (parent folder via file selector) that mounts the SPA, plus a full SPA scaffold under `src/spas/<name>/` (App, Redux store with ajax/feedback slices, extra-actions/apis, scenes). Adds a rewrite in Next config so the SPA route is client-routed. |
| `scene` | pkg-spa    | New scene (route/container) inside an existing SPA under `src/spas/<spa>/scenes/`.                                                                                                                                                                                                                  |
| `slice` | pkg-spa    | New Redux slice for an SPA: state, interfaces, selectors, optional sagas; registered in the SPA’s slices index.                                                                                                                                                                                     |
| `ajax`  | pkg-spa    | New API call for an SPA: adds an action under `redux-store/extra-actions/apis/` for a given HTTP method and route (supports path params).                                                                                                                                                           |

---

### Authentication

| Command            | Depends on      | Purpose                                                                                                                                                                                                                                                                                                           |
| ------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cookie-auth-role` | pkg-cookie-auth | Adds one or more cookie-auth roles (e.g. `admin`, `user`). Creates session model per role under `src/models/server/`, updates `src/lib/session/index.ts` (iron-session config and typings), and extends `.genyg.json` and env template. API and page generators can then attach a role to endpoints or SSR pages. |

---

### AWS Scheduler

Requires AWS credentials and region in `.genyg.ignore.json`. All scheduler commands depend on **pkg-core**.

| Command                | Purpose                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aws-scheduler-role`   | Creates an IAM role for EventBridge Scheduler (with permission to put events to a chosen event bus). **Run before the first `aws-scheduler`.**                                                                                                                                                                                                                               |
| `aws-scheduler`        | Creates a full scheduled “API call”: destination role (optional), connection (optional), event bus (optional), API destination, rule, target, and a schedule. Also scaffolds the same endpoint structure as `api` (handler, validations, interfaces, tests, pages/api route) so the scheduler can call that route. You choose invocation rate and status (ENABLED/DISABLED). |
| `aws-update-scheduler` | Updates an existing GeNYG scheduler: status and/or invocation rate.                                                                                                                                                                                                                                                                                                          |
| `aws-delete-scheduler` | Deletes a GeNYG scheduler and its associated rule and API destination.                                                                                                                                                                                                                                                                                                       |

---

### Other

| Command   | Purpose                                             |
| --------- | --------------------------------------------------- |
| `version` | Prints the generator’s version (from package.json). |

---

## Dependency summary

- **app** → none (run in empty dir).
- **pkg-core** → run after `app`; many others depend on it.
- **pkg-mui** → pkg-core.
- **pkg-spa** → pkg-core.
- **pkg-translations** → pkg-mui.
- **pkg-mongodb** → pkg-core.
- **pkg-postgresql** → pkg-core.
- **pkg-cookie-auth** → pkg-core.
- **page, comp, api, model, task** → pkg-core (**form** → pkg-mui; **api** can use cookie-auth if configured).
- **spa, scene, slice, ajax** → pkg-spa.
- **cookie-auth-role** → pkg-cookie-auth.
- **model-mongodb** → pkg-mongodb.
- **aws-scheduler-role, aws-scheduler, aws-update-scheduler, aws-delete-scheduler** → pkg-core; **aws-scheduler** should be run after **aws-scheduler-role** when creating the first scheduler.

---

## License

MIT · Getapper
