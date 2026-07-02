import type { NextConfig } from "next";
import path from "path";

const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: path.join(__dirname),
  transpilePackages: [
    "@radix-ui/primitive",
    "@radix-ui/react-arrow",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-collection",
    "@radix-ui/react-compose-refs",
    "@radix-ui/react-context",
    "@radix-ui/react-dialog",
    "@radix-ui/react-direction",
    "@radix-ui/react-dismissable-layer",
    "@radix-ui/react-focus-guards",
    "@radix-ui/react-focus-scope",
    "@radix-ui/react-id",
    "@radix-ui/react-label",
    "@radix-ui/react-popper",
    "@radix-ui/react-portal",
    "@radix-ui/react-presence",
    "@radix-ui/react-primitive",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "@radix-ui/react-slot",
    "@radix-ui/react-toast",
    "@radix-ui/react-use-callback-ref",
    "@radix-ui/react-use-controllable-state",
    "@radix-ui/react-use-escape-keydown",
    "@radix-ui/react-use-layout-effect",
    "@radix-ui/react-visually-hidden",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};
export default nextConfig;
