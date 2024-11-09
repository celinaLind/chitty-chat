# Chitty Chat

## Table of Contents

- [Tools Used](#tools-used)
- [Development Notes](#development-notes)

## Tools Used

- [pnpm](https://pnpm.io/installation) => make a medium article of npm vs. pnpm
- [Convex](https://www.convex.dev/)
- [Clerk](https://clerk.com/docs)
- [svix]()

## Development Notes

### Commands

    pnpm i -D prettier

**_the command above installs prettier in the package.json as a Development tool (-D)_**

    pnpm i -D npm-run-all

In the package.json file update dev commands to the following:

    "dev": "run-p dev:*",
    "dev:convex": "convex dev",
    "dev:next": "next dev --turbopack",

The above code tells the npm run all command to run all the dev: commands. While there is a dev command to run the convex backend and the next app. All you need to do is run the following in the terminal to see it done locally:

    pnpm dev

**_An interface is a way to define a type in TypeScript_**

    interface Message {
        sender: string;
        content: string;
    }

When you run a mutation it updates ALL queries automatically

### Convex Dashboard Tabs

- Data (all saved data)
- Functions (the functions you create and are using)
- Files (uploaded files)
- Schedules (where you see and schedule jobs) _not using for this project_
- Logs (Console log statements for your functions are found here and not in your own console when using convex)

### Convex Folder

- \_generated folder is updated automatically by convex to create types for our backend that can be used on our frontend

### [Webhook Validation](https://clerk.com/docs/integrations/webhooks/overview?_gl=1*c4vk4p*_gcl_au*NDYyNDQxMjUxLjE3MzExMTkyNjc.*_ga*MTU1MjYwMTI2NC4xNzMxMTE5MjY3*_ga_1WMF5X234K*MTczMTExOTI2Ny4xLjEuMTczMTEyMDIxMy4wLjAuMA..)

Install svix to handle webhook validation requests

    pnpm add svix

Do the following within Clerk:

- Create new webhook
- Add Endpoint Url found in convex under HTTP Actions Url
- Add '/clerk-webhook' to the end of the url found above
- Subscribe to ALL events you need (in this case 'user')

Do following in Convex:

- Add the "Signing Secret" found in clerk after webhook creation as CLERK_WEBHOOK_SECRET under env variables
