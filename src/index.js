/*
 *                        _oo0oo_
 *                       o8888888o
 *                       88" . "88
 *                       (| -_- |)
 *                       0\  =  /0
 *                     ___/`---'\___
 *                   .' \\|     |// '.
 *                  / \\|||  :  |||// \
 *                 / _||||| -:- |||||- \
 *                |   | \\\  - /// |   |
 *                | \_|  ''\---/''  |_/ |
 *                \  .-\__  '-'  ___/-. /
 *              ___'. .'  /--.--\  `. .'___
 *           ."" '<  `.___\_<|>_/___.' >' "".
 *          | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *          \  \ `_.   \_ __\ /__ _/   .-` /  /
 *      =====`-.____`.___ \_____/___.-`___.-'=====
 *                        `=---='
 *      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 
 *            佛祖保佑       永不宕机     永无BUG
 */

'use strict';
const { extractVariableSelection, getScriptTemplate, getRegExp } = require('./utils');
const { ConcatSource } = require("webpack-sources");
const defaultOption = {
  fileName: 'variable-[hash].js',
  matchVariables: {},
  publicPath: '',
  htmlFileName: '',// tell me where the entry html file is
  buildPath: '',
  nextSupport: false, // if your server was built by next.js , nextSupport should be true
  // 是否需要将生成后的代码注入到打包的js中，如果穿了htmlFileName，此参数可传false，否则必须为true
  injectToEntry: false,// if inject functions to all entry files
  // 需要排除的entry文件名，支持传入正则或者正则字符串
  excludeEntry: null,
  // 需要指定的entry文件名，支持传入正则或者正则字符串，不传默认所有
  specifyEntry: null
};
class VariableReplacer {
  constructor(options) {
    this.options = { ...defaultOption, ...options };
  }

  apply (compiler) {
    compiler.hooks.emit.tapAsync('VariableReplacer', (compilation, callback) => {
      const assets = compilation.assets;
      const { matchVariables, htmlFileName, nextSupport, injectToEntry } = this.options;
      let templateString = '';
      console.log('🚀 ------------------------------------~ CSS  THEME--------------------------------------',)
      if (compilation.name === 'server' || !this.options.nextSupport) {
        Object.keys(assets).forEach((key) => {
          console.log('🚀 ~ file: index.js ~ line 37 ~ Object.keys ~ key', key)
          if (/\.css$/.test(key)) {
            const styleAsset = assets[key];
            const extractCss = extractVariableSelection(styleAsset.source(), matchVariables)
            templateString += extractCss.allExtractedVariable;
            compilation.assets[key] = {
              source: () => extractCss.beExtractedStyles,
              size: () => extractCss.beExtractedStyles.length
            }
          }
        })
        global.templateString = templateString;
      } else {
        templateString = global.templateString;
      }
      const { fileName, buildPath } = this.options;
      // console.log('🚀 ~ file: index.js ~ line 62 ~ Object.keys ~ templateString', templateString.length)

      const output = `${buildPath}${fileName}`.replace('[hash]', compilation.hash);
      const resolvedTemplateString = getScriptTemplate(matchVariables, templateString);

      if (htmlFileName) {
        compilation.assets[output] = {
          source: () => resolvedTemplateString,
          size: () => resolvedTemplateString.length
        };
        this.injectToHTML(compilation, resolvedTemplateString);
      }
      // if (injectToEntry || nextSupport) {
      //   this.injectToEntry(compilation, resolvedTemplateString);
      // }
      console.log('🚀 ------------------------------------~ CSS  THEME  END~~~~~~~~~~~~~--------------------------------------',)
      callback();
    });
  }

  injectToHTML (compilation) {
    const { publicPath, fileName, htmlFileName } = this.options;
    const htmlAsset = compilation.getAsset(htmlFileName);
    const htmlTemp = htmlAsset.source.source().replace(`</body>`, `<script type="text/javascript" src="${`${publicPath}${fileName}`.replace('[hash]', compilation.hash)}"></script></body>`) + '';
    compilation.assets[htmlFileName] = {
      source: () => htmlTemp,
      size: () => htmlTemp.length
    }
  }

  injectToEntry (compilation, templateString) {
    const onlyEntryPoints = {
      entrypoints: true,
      errorDetails: false,
      modules: false,
      assets: false,
      children: false,
      chunks: false,
      chunkGroups: false
    };
    const entryPoints = compilation.getStats().toJson(onlyEntryPoints).entrypoints;
    const { excludeEntry, specifyEntry } = this.options;

    Object.keys(entryPoints).forEach(entryName => {
      var entryAssets = entryPoints[entryName].assets;
      entryAssets.forEach(assetName => {
        if (/\.js$/.test(assetName) && (!specifyEntry || getRegExp(specifyEntry).test(assetName)) && !(excludeEntry && getRegExp(excludeEntry).test(assetName))) {
          const assetSource = compilation.assets[assetName]
          if (!assetSource._hasInjected) {
            const resolvedSource = new ConcatSource(assetSource.source(), templateString);
            resolvedSource._hasInjected = true;
            compilation.assets[assetName] = resolvedSource;
          }
        }
      })
    })
  }
}
module.exports = VariableReplacer;
