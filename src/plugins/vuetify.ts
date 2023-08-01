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

const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#9163cb",
    secondary: "#c19ee0",
    tertiary: "#dec9e9",
    accent: "#e7c6ff",
    quarternary: "#e7d8f7",
  },
};

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: "#2196F3",
    secondary: "#424242",
    tertiary: "#E57373",
    accent: "#8A2BE2",
    quarternary: "#B0D1E8",
  },
};

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "lightTheme",
    themes: {
      lightTheme,
      darkTheme,
    },
  },
});
