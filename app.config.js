export default ({ config }) => ({
  ...config,
  owner: "ejd5757",
  extra: {
    ...config.extra,        // keep everything from app.json
    API_URL: "http://129.80.33.141:4000",
  },
});