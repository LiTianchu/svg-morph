// need to add override to ignore the warning from ffmpeg to pass the CI
module.exports = function override(config) {
  config.ignoreWarnings = [
    ...(config.ignoreWarnings || []),
    {
      module: /@ffmpeg[\\/]ffmpeg[\\/]dist[\\/]esm[\\/]worker\.js$/,
      message:
        /Critical dependency: the request of a dependency is an expression/,
    },
  ];

  return config;
};
