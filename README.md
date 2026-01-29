# generator-g-next

**GeNYG** (Getapper NextJS Yeoman Generator) is a [Yeoman](https://yeoman.io/) generator for scaffolding, developing, testing, and deploying **Next.js** applications. It provides a set of composable sub-generators for pages, APIs, SPAs, forms, AWS schedulers, authentication, and more, so you can bootstrap and extend a Next.js project in a consistent way.

---

## Purpose of this repository

This repository is the **Getapper NextJS Yeoman Generator**: a single place that defines how Next.js apps are structured at Getapper. It:

- **Bootstraps** new Next.js apps with a fixed stack (TypeScript, ESLint, `src` layout).
- **Adds optional packages** (MUI, Redux/SPA, i18n, MongoDB, Cognito, cookie auth) via `pkg-*` generators.
- **Scaffolds features** (pages, API routes, components, forms, Redux slices, SPAs, models, tasks) so file layout and patterns stay consistent.
- **Integrates with AWS** (EventBridge, Scheduler, IAM) to create and manage scheduled API invocations.

You run it with `yo g-next:<subgenerator>` (or `npx yo g-next:<subgenerator>`) from inside a project. Most feature generators depend on having run the right `pkg-*` (and sometimes `app`) first; the generator will tell you if a required package is missing.

---

## Getting started

1. **Install the generator** (global or via npx):
   ```bash
   npm install -g yo generator-g-next
   ```
2. **Create and enter a new project folder** (e.g. clone an empty repo or `mkdir my-app && cd my-app`).
3. **Bootstrap the app** with `yo g-next:app` (see below).
4. **Install the core package** with `yo g-next:pkg-core` (recommended right after the app).
5. **Add optional packages** (e.g. `pkg-mui`, `pkg-spa`) and then use the feature generators (page, api, comp, form, slice, etc.).

---

## Generators overview

### Bootstrap

| Command              | Purpose                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `yo g-next:app`      | Creates the Next.js app in the current directory via `create-next-app` (TypeScript, npm, ESLint, `src` dir, no Tailwind). Run in an empty project folder.                                              |
| `yo g-next:pkg-core` | **Requires:** fresh Next.js app. Installs GeNYG “core”: ESLint + Prettier, Husky + lint-staged, Jest, env handling, `.genyg.json`, AppHead, response-handler and test utils. **Run once after `app`.** |

---

### Packages (run once per project)

These add dependencies and shared code; many other generators depend on them.

| Command                      | Depends on | Purpose                                                                                                                                                                              |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `yo g-next:pkg-core`         | —          | Core tooling and GeNYG config (see above).                                                                                                                                           |
| `yo g-next:pkg-mui`          | pkg-core   | MUI (Material UI), react-hook-form, yup, Emotion; form primitives (FormTextField, FormSelect, FormDatePicker, etc.), AppButton, AppSnackbar, themes, useConfirmDialog, useFormField. |
| `yo g-next:pkg-spa`          | pkg-core   | Redux Toolkit, Redux Saga, redux-persist, react-router-dom, axios. Base for building SPAs inside Next.js.                                                                            |
| `yo g-next:pkg-translations` | pkg-mui    | i18next + react-i18next; translation folders (en/it/fake), types, LanguageMenu, TranslatedRoute, useInitializeTranslations, useTypedTranslations.                                    |
| `yo g-next:pkg-mongodb`      | pkg-core   | MongoDB driver; lib for connection and DAO; env vars (MONGODB_URI, MONGODB_NAME).                                                                                                    |
| `yo g-next:pkg-cognito`      | pkg-spa    | AWS Cognito: amazon-cognito-identity-js, aws-amplify, aws-sdk, JWT handling; FE/BE env vars and lib/model stubs.                                                                     |
| `yo g-next:pkg-cookie-auth`  | pkg-core   | Cookie-based auth with `iron-session`; test session helpers. Registers in `.genyg.json`; use with `cookie-auth-role` to add roles.                                                   |

---

### Pages and UI building blocks

| Command          | Depends on | Purpose                                                                                                                                                                       |
| ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yo g-next:page` | pkg-core   | New Next.js page under `src/pages/`. Choose path, name, dynamic segments (e.g. `[id]`, `[[...params]]`), and rendering: none, SSG, or SSR. Optional cookie-auth role for SSR. |
| `yo g-next:comp` | pkg-core   | New React component + hooks file under `src/components/` (optionally in a subfolder).                                                                                         |
| `yo g-next:form` | pkg-mui    | New form component with FormProvider and yup schema under `src/components/`.                                                                                                  |

---

### API and backend

| Command                   | Depends on  | Purpose                                                                                                                                                                     |
| ------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yo g-next:api`           | pkg-core    | New API endpoint: handler, interfaces, validations, test, and wiring under `src/endpoints/` plus the corresponding route under `src/pages/api/`. Optional cookie-auth role. |
| `yo g-next:model`         | pkg-core    | New model file in `src/models/client`, `server`, or `common` (for React-only, Node-only, or shared code).                                                                   |
| `yo g-next:model-mongodb` | pkg-mongodb | New server-side MongoDB model under `src/models/server/` using the project’s MongoDB template (collection name derived from model name).                                    |
| `yo g-next:task`          | pkg-core    | New task under `src/tasks/` with `index.ts` and `exec.ts`, plus a `TASK:<TaskName>` script in package.json (ts-node with path mapping). Optional MongoDB usage.             |

---

### Single Page Applications (SPA)

| Command           | Depends on | Purpose                                                                                                                                                                                                                               |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yo g-next:spa`   | pkg-spa    | New SPA: a Next.js page that mounts the SPA + a full SPA scaffold under `src/spas/<name>/` (App, Redux store with ajax/feedback slices, extra-actions/apis, scenes). Adds a rewrite in Next config so the SPA route is client-routed. |
| `yo g-next:scene` | pkg-spa    | New scene (route/container) inside an existing SPA under `src/spas/<spa>/scenes/`.                                                                                                                                                    |
| `yo g-next:slice` | pkg-spa    | New Redux slice for an SPA: state, interfaces, selectors, optional sagas; registered in the SPA’s slices index.                                                                                                                       |
| `yo g-next:ajax`  | pkg-spa    | New API call for an SPA: adds an action under `redux-store/extra-actions/apis/` for a given HTTP method and route (supports path params).                                                                                             |

---

### Authentication

| Command                      | Depends on      | Purpose                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yo g-next:cognito`          | pkg-cognito     | Injects Cognito Redux slice (sagas, selectors, interfaces) into a chosen SPA.                                                                                                                                                                                                                                     |
| `yo g-next:cookie-auth-role` | pkg-cookie-auth | Adds one or more cookie-auth roles (e.g. `admin`, `user`). Creates session model per role under `src/models/server/`, updates `src/lib/session/index.ts` (iron-session config and typings), and extends `.genyg.json` and env template. API and page generators can then attach a role to endpoints or SSR pages. |

---

### AWS Scheduler

Requires AWS credentials and region in `.genyg.ignore.json`. All scheduler commands depend on **pkg-core**.

| Command                          | Purpose                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yo g-next:aws-scheduler-role`   | Creates an IAM role for EventBridge Scheduler (with permission to put events to a chosen event bus). **Run before the first `aws-scheduler`.**                                                                                                                                                                                                                               |
| `yo g-next:aws-scheduler`        | Creates a full scheduled “API call”: destination role (optional), connection (optional), event bus (optional), API destination, rule, target, and a schedule. Also scaffolds the same endpoint structure as `api` (handler, validations, interfaces, tests, pages/api route) so the scheduler can call that route. You choose invocation rate and status (ENABLED/DISABLED). |
| `yo g-next:aws-update-scheduler` | Updates an existing GeNYG scheduler: status and/or invocation rate.                                                                                                                                                                                                                                                                                                          |
| `yo g-next:aws-delete-scheduler` | Deletes a GeNYG scheduler and its associated rule and API destination.                                                                                                                                                                                                                                                                                                       |

---

### Other

| Command             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `yo g-next:version` | Prints the generator’s version (from package.json). |

---

## Dependency summary

- **app** → none (run in empty dir).
- **pkg-core** → run after `app`; many others depend on it.
- **pkg-mui** → pkg-core.
- **pkg-spa** → pkg-core.
- **pkg-translations** → pkg-mui (and thus pkg-core).
- **pkg-mongodb** → pkg-core.
- **pkg-cognito** → pkg-spa.
- **pkg-cookie-auth** → pkg-core.
- **page, comp, api, model, task** → pkg-core (and **form** → pkg-mui; **api** / **page** can use cookie-auth if configured).
- **spa, scene, slice, ajax** → pkg-spa.
- **cognito** (Cognito slice in SPA) → pkg-cognito.
- **cookie-auth-role** → pkg-cookie-auth.
- **model-mongodb** → pkg-mongodb.
- **aws-scheduler-role, aws-scheduler, aws-update-scheduler, aws-delete-scheduler** → pkg-core; **aws-scheduler** should be run after **aws-scheduler-role** when creating the first scheduler.

---

## License

MIT · Getapper
