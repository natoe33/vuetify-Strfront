/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify, ThemeDefinition } from "vuetify";

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: "#000000",
    primary: "#9E7EF9",
    secondary: "#383838",
    accent: "#FFFFFF",
  },
};

const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#F6F6F8",
    primary: "#6C5DD3",
    secondary: "#1B1D21",
    accent: "#B8DCE9",
  },
};

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "dark",
    variations: {
      colors: ['primary'],
      lighten: 2,
      darken: 2,
    },
    themes: {
      dark,
      light,
    },
  },
});
