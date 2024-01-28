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
    background: "#5E35B1",
    primary: "#7E3FF2",
    secondary: "#3AC421",
    accent: "#B2AEB8",
  },
};

const light: ThemeDefinition = {
  dark: false,
  colors: {
    background: "#9575CD",
    primary: "#7E3FF2",
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
