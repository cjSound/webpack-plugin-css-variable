## webpack-plugin-css-variable

Extract CSS variables that change dynamically through JS Function:`window.replaceVariable`,

### how to (3 steps)
- Step1: import plugin in your webpack.config.js(don't forget to install plugin).

``` javascript
const WebpackCssVariable = require('webpack-plugin-css-variable'); 
```

- step:2: config your plugin: 

``` javascript
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
    config.plugins.push(new WebpackCssVariable({
      htmlFileName: 'index.html',
      injectToEntry: true,
      matchVariables: {
        main: '#42b983',
        mainHover: '#d1dd1d',
      }
    }))
  }
}
```



- step3: call function in anywhere in your code.

``` javascript
window.replaceStyleVariable({ main: '#fff', mainHover: '#999' })
```

This step can be called any where (plugin has been injected to the html file ). The arguments need only one which is the stylesheet variable you want to replace to . Such as you want to change `main` to blue color , your argument will be : '{main:"blue"}',the key for this argument should math your config (step2).
## zh-cn (中文说明)

### 简单三步实现网页换肤功能

- **第一步** 引入包 

> const configureWebpack =require('webpack-plugin-css-variable'); 

- **第二步** 定义webpack plugin

> new configureWebpack({matchVariables: {main: '#456789'}})

- **第三步** 任何地方调用方法实现换肤

> window.replaceStyleVariable({main:'#987654'})
## 参考优化


- **参考** [webpack-stylesheet-variable-replacer-plugin](https://github.com/eaTong/webpack-stylesheet-variable-replacer-plugin)

- 优化 css 提取，将含css变量的css内容从主css抽离，**独立单独主题style**
