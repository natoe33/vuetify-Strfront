/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
// import pinia from "../store";
import { createPinia } from "pinia";
import router from "../router";

// Types
import type { App } from "vue";

const pinia = createPinia();

export function registerPlugins(app: App) {
  loadFonts();
  app.use(vuetify).use(router).use(pinia);
}
