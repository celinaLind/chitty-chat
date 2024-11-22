# Chitty Chat

This is a Discord clone currently with the ability to create and account, send and receive friend requests, and send and receive messages and images.

To come:

- Video and Voice Calls
- Styling updates

## Table of Contents

- [Tools Used](#tools-used)
- [Development Notes](#development-notes)

## Tools Used

- [pnpm](https://pnpm.io/installation) => make a medium article of npm vs. pnpm
- [Convex](https://www.convex.dev/)
- [Clerk](https://clerk.com/docs)
- [svix]()
- [shadcn]()
- [LiveKit](https://livekit.io/)

## Development Notes

Using "Rename Symbol" allows you to rename a function or variable once and for it to be updated everywhere the name is referenced.

"/join" is not included in the dashboard folder because we want users to be able to access the invite page without having to be authenticated/logged in.

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

    Shift + Alt + o

the above command will remove any unused import statements from your code

    pnpm add convex-helpers

- [convex-helpers](https://www.npmjs.com/package/convex-helpers) gives higher level utility functions to use in the helpers.ts file

  pnpm tsc --noEmit
  -- OR --
  npx tsc --noEmit

The above commands are Typescript checkers to verify that everything has been updated accordingly. Will return nothing if no errors or return a detailed error if any occur.

    pnpm add livekit-server-sdk
    pnpm add @livekit/components-react @livekit/components-styles

Add LiveKit to project

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
