import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
	// https://vike.dev/head-tags
	title: "aevatar.sdk.demo",
	description: "the future of on-chain autonomous intelligence",

	extends: vikeReact,
	htmlAttributes: {
		class: "dark",
	},
	bodyAttributes: { class: "bg-background text-foreground" },
  meta: {
    data: {
      // .client.js
      env: { server: false, client: true }
    }
  }
} satisfies Config;
