/*
 * @Author: 曹捷
 * @Date: 2021-10-14 09:39:10
 * @LastEditors: 曹捷
 * @LastEditTime: 2021-10-18 22:24:28
 * @Description: fileContent
 */
// vue.config.js
const WebpackVariableReplacer = require('webpack-stylesheet-variable-replacer-plugin')

module.exports = {
  publicPath: './',
  css: {
    // CSS Modules 模块
    requireModuleExtension: false,
    //提取 CSS 在开发环境模式下是默认不开启的，因为它和 CSS 热重载不兼容。 默认开发模式不开启，部署开启
    // 当需要测试主题的时候开启，无需测试关闭
    extract: true
  },
  configureWebpack: config => {
    config.plugins.push(new WebpackVariableReplacer({
      htmlFileName: 'index.html',
      injectToEntry: true,
      matchVariables: {
        main: '#42b983',
        mainHover: '#d1dd1d',
      }
    }))
  }
}
