const CSS_REG = /[^}]*\{[^{]*\}/g;
const RULE_REG = /(\w+-)*\w+:/;
const CSS_VALUE_REG = /(\s?[a-z0-9]+\s)*/;
const SAFE_EMPTY_REG = /\s?/;
const IMPORTANT_SAFE_REG = /(!important)?/;
const CSS_LOADER_EXPORT = /___CSS_LOADER_EXPORT___.push.*\)/g;

/**
 * 
 * @param {*} styles 
 * css文件内容
 * @param {*} matchVariables 
 * 需要替换的动态变量
 * @returns 
 */
function extractVariableSelection (styles, matchVariables) {
  styles = styles.replace(/\r|\t|\n/g, '');
  const matchVariableValues = Object.keys(matchVariables).map(item => matchVariables[item]);
  const valueKey = reverseKeyValue(matchVariables);
  // 单个css 选择器样式
  let cssExpressions = styles.match(CSS_REG);
  let reslut = {
    // 抽离单独的变量样式文件
    allExtractedVariable: '',
    // 被抽离变量样式的源文件
    beExtractedStyles: ''
  }
  const variableReg = getVariablesReg(matchVariableValues);
  if (!cssExpressions || cssExpressions.length === 0) {
    return '';
  }
  for (let idx in cssExpressions) {
    let expression = cssExpressions[idx]
    if (variableReg.test(expression)) {
      const selector = expression.match(/[^{]*/)[0];
      if (/^@.*keyframes/.test(selector)) {
        reslut.allExtractedVariable += `${selector}{${extractVariableSelection(expression.replace(/[^{]*\{/, '').replace(/}$/, ''), matchVariables).allExtractedVariable}}`;
      } else {
        const colorRules = expression.match(combineRegs('g', '', RULE_REG, SAFE_EMPTY_REG, CSS_VALUE_REG, variableReg, SAFE_EMPTY_REG, IMPORTANT_SAFE_REG));
        if (colorRules) {
          const colorReplaceTemplates = colorRules.map(item => item.replace(variableReg, str => `DL-${valueKey[str.replace(/\s/g, '').replace(/0?\./, '.')]}`));
          console.log('🚀 ~ file: utils.js ~ line 37 ~ extractVariableSelection ~ colorReplaceTemplates', colorReplaceTemplates)
          reslut.allExtractedVariable += `${selector}{${colorReplaceTemplates.join(';')}}`;
          colorRules.map(element => {
            expression = expression.replace(new RegExp(`${element};`, 'g'), '')
          })
          cssExpressions[idx] = expression
          console.log('🚀 ~ file: utils.js ~ line 42 ~ extractVariableSelection ~ expression', expression)
        }
      }
    }
  }
  reslut.beExtractedStyles = cssExpressions.join(' ')
  console.log('🚀 ~ file: utils.js ~ line 47 ~ extractVariableSelection ~ reslut', reslut)
  return reslut;
}

function reverseKeyValue (obj) {
  const temp = {};
  Object.keys(obj).forEach(key => {
    temp[obj[key].replace(/\s/g, '').replace(/0?\./, '.')] = key;
  });
  return temp;
}

function getVariablesReg (colors) {
  return new RegExp(colors.map(i => `(${i.replace(/\s/g, ' ?').replace(/\(/g, `\\(`).replace(/\)/g, `\\)`).replace(/0?\./g, `0?\\.`)}\\b)`).join('|'));
}

function combineRegs (decorator = '', joinString = '', ...args) {
  const regString = args.map(item => {
    const str = item.toString();
    return `(${str.slice(1, str.length - 1)})`
  }).join(joinString);
  return new RegExp(regString, decorator);
}

function getScriptTemplate (matchVariables, styleStr) {
  return `
    function replaceStyleVariable(replaceVariables) {
      var unionId = '${Math.random() + new Date().getTime()}';
      var option = JSON.parse('${JSON.stringify(matchVariables)}');
      for(var key in replaceVariables){
        option[key] = replaceVariables[key];
      }
      var str = '${styleStr}';
      var style = document.getElementById(unionId);
      if (!style) {
        style = document.createElement('style');
        style.id = unionId;
        style.setAttribute('class',"obit_theme")
        document.head.appendChild(style);
      }
      for (var key in option) {
        var reg = new RegExp('DL-' + key+'\\\\b', 'g');
        str = str.replace(reg, option[key]);
      }
      style.innerText = str;
      let styleList  = document.getElementsByClassName('obit_theme')
      if(styleList){
        for(let item of styleList){
          if(item.id !==unionId)
          document.head.removeChild(item);
        }
        
      }

    window.resetStyle = function(){
      var style = document.getElementById(unionId);
      if(style){
        document.head.removeChild(style);
      }
    }
  };
  replaceStyleVariable({})
`
}

function getRegExp (val) {
  if (typeof val === 'string') {
    return new RegExp(val.replace(/\*/g, '.*').replace(/\./g, '\\.'));
  } else if (val instanceof Array) {
    return combineRegs('', '|', ...val.map(item => getRegExp(item)))
  } else if (val instanceof RegExp) {
    return val;
  }
}

function getStyleFromModule (moduleStr) {
  if (moduleStr.match(CSS_LOADER_EXPORT)) {
    const styleArr = moduleStr.match(CSS_LOADER_EXPORT);
    let totalStyle = '';
    styleArr.forEach(str => {
      totalStyle += str.replace(/^___CSS_LOADER_EXPORT___.push[^"]*"/, '').replace(/",.*$/, '');
    });
    return totalStyle
  }
  return '';
}

module.exports = { extractVariableSelection, getScriptTemplate, getRegExp, getStyleFromModule };
