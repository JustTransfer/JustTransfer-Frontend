import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [index("routes/home.tsx"), route("login", "routes/login.tsx"), route("create-account", "routes/createaccount.tsx"), route("account", "routes/account.tsx")] satisfies RouteConfig;
