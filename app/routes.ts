import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("login", "routes/login.tsx"), route("create-account", "routes/createaccount.tsx"), route("account", "routes/account.tsx"), route("inbox", "routes/inbox.tsx"), route("new-transfer", "routes/new-transfer.tsx"), route("transfers", "routes/transfers.tsx"),] satisfies RouteConfig;
