# Project Structure

```text
devinepremium
├── AGENT.md
├── README.md
├── docs
│   ├── architecture.md
│   ├── project-structure.md
│   └── setup.md
├── packages
│   └── devinepremium-shared
│       ├── package.json
│       ├── README.md
│       └── src
│           ├── domain.js
│           ├── domain.d.ts
│           ├── http.js
│           ├── http.d.ts
│           ├── index.js
│           ├── index.d.ts
│           ├── session.js
│           └── session.d.ts
├── devinepremium-frontend
│   ├── app
│   ├── components
│   ├── lib
│   ├── public
│   ├── package.json
│   └── tsconfig.json
├── devinepremium-admin-dashboard
│   ├── app
│   ├── lib
│   ├── package.json
│   └── tsconfig.json
└── devinepremium-backend
    ├── data
    ├── src
    │   ├── config
    │   ├── entities
    │   ├── middleware
    │   ├── routes
    │   ├── services
    │   ├── types
    │   └── utils
    ├── package.json
    └── tsconfig.json
```

## Standard Split

- `devinepremium-frontend`: customer site only
- `devinepremium-admin-dashboard`: admin operations only
- `devinepremium-backend`: API and database only
- `packages/devinepremium-shared`: shared code, no duplicated API/session/domain logic
