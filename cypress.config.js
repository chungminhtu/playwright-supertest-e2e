const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportWidth: 1000,
  viewportHeight: 660,
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
