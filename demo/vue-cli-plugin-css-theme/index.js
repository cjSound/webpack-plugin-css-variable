/*
 * @Author: 曹捷
 * @Date: 2021-10-18 11:00:32
 * @LastEditors: 曹捷
 * @LastEditTime: 2021-10-18 13:03:23
 * @Description: fileContent
 */
const path = require('path');

const { pluginName, webpackPluginName } = require('./constant');

module.exports = (api, projectOptions) => {
  const pluginOptions = projectOptions.pluginOptions[pluginName]
  api.chainWebpack(webpackConfig => {
    [
      'normal',
      'normal-modules',
      'vue',
      'vue-modules',
    ].forEach((oneOf) => {
      const loaders = webpackConfig.module.rule('less').oneOf(oneOf);
      // 开启js
      loaders.use('less-loader').options({
        javascriptEnabled: true,
      });
      loaders.use('less-theme-loader').loader(path.resolve(api.service.context, `./node_modules/${webpackPluginName}/loader.js`));
    });
  });
  api.configureWebpack(webpackConfig => {
    return {
      plugins: [
      ],
    };
  });
}
