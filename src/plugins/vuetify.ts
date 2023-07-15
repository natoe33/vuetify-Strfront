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

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#1867c0",
          secondary: "#5CBBF6",
          tertiary: "#E57373",
          accent: "#005CAF",
          quarternary: "#B0D1E8",
        },
      },
      dark: {
        colors: {
          primary: "#2196F3",
          secondary: "#424242",
          tertiary: "#E57373",
          accent: "#FF4081",
          quarternary: "#B0D1E8",
        },
      },
    },
  },
});
