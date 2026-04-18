module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // NativeWind v4 only needs jsxImportSource; the separate "nativewind/babel"
      // preset is a v2 pattern and triggers the react-native-worklets/plugin error.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [],
  };
};
