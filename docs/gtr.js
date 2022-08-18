// ================================================================================
// Google Translator (JavaScript Version)
// ================================================================================

(() => {
  // For Deno・Node.js
  // ================================================================================
  
  const usage = (fileName, type) => {
    console.log(`
${fileName} - Google Translator (${type} Version)

Usage: ${fileName} [options] <text>

Arguments:
  text  Text To Translate

Options:
  -s <string>    Source Language (Default 'auto')
  -t <string>    Target Language (Default 'en')
  -v, --verbose  Print Raw Response For Debugging
  -h, --help     Print This Usage And Quit

Examples:
    $ ${fileName} 'こんにちは'
    hello
    $ ${fileName} -t 'ja' 'Hello'
    こんにちは
    $ ${fileName} -s 'en' -t 'zh-CN' 'Hello'
    你好`);
  };
  
  const invalid = (fileName, type, message, exit1Function) => {
    usage(fileName, type);
    console.error('');
    console.error(`Invalid : ${message}`);
    return exit1Function();
  };
  
  const parseOptions = (fileName, type, options, exit0Function, exit1Function) => {
    let s         = null ;  // Source Language
    let t         = null ;  // Target Language
    let text      = null ;  // Text To Translate
    let isVerbose = false;  // IsVerbose Mode
    
    for(let i = 0; i < options.length; i++) {
      const option = options[i];
      if(['-h', '--help'].includes(option)) {
        usage(fileName, type);
        return exit0Function();
      }
      else if(['-v', '--verbose'].includes(option)) {
        isVerbose = true;
      }
      else if(option === '-s') {
        const optionValue = options[i + 1];
        if(optionValue == null || optionValue.startsWith('-')) {
          invalid(fileName, type, '\'-s\' (Source Language) Requires An Argument', exit1Function);
          return exit1Function();
        }
        s = optionValue;
        ++i;
      }
      else if(option === '-t') {
        const optionValue = options[i + 1];
        if(optionValue == null || optionValue.startsWith('-')) {
          invalid(fileName, type, '\'-t\' (Target Language) Requires An Argument', exit1Function);
          return exit1Function();
        }
        t = optionValue;
        ++i;
      }
      else if(option.startsWith('-')) {
        invalid(fileName, type, `Illegal Option -- '${option}'`, exit1Function);
        return exit1Function();
      }
      else {
        text = option;
      }
    }
    if(!text) {
      invalid(fileName, type, 'Please Input Text', exit1Function);
      return exit1Function();
    }
    //console.log({ s, t, isVerbose, text });
    return { s, t, isVerbose, text };
  };
  
  const showResult = (result, isVerbose) => {
    if(isVerbose) {
      console.log('Raw Response :');
      try {
        console.log(JSON.stringify(JSON.parse(result), null, '  '));
      }
      catch(_error) {
        console.log(result);
      }
      console.log('');
    }
    try {
      const json = JSON.parse(result);
      console.log(json.sentences.map(sentence => sentence.trans).join(''));
    }
    catch(error) {
      console.error('Parse Error :');
      console.error(error);
      console.error(result);
    }
  };
  
  // For Deno・Node.js・Browser
  // ================================================================================
  
  const createUrl = (sourceLanguage, targetLanguage, text) => {
    const params = new URLSearchParams({
      sl: sourceLanguage ?? 'auto',  // Source Language or Default 'auto'
      tl: targetLanguage ?? 'en'  ,  // Target Language or Default 'en'
      ie: 'utf-8',  // Input Encoding
      oe: 'utf-8',  // Output Encoding
      dt: 't',
      dj: '1',
      client: 'gtx',  // Translate Client
      q : text        // Text To Translate
    }).toString();
    const url = `https://translate.googleapis.com/translate_a/single?${params}`;
    const userAgent = 'GoogleTranslate/6.6.1.RC09.302039986 (Linux; U; Android 9; Redmi Note 8)';
    return { url, userAgent };
  };
  
  // Detect Environment To Exec
  // ================================================================================
  
  if(typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    // For Browser
    window.gtrCreateUrl = createUrl;
  }
  else if(typeof Deno !== 'undefined' && typeof Deno.core !== 'undefined') {
    // Deno
    (async () => {
      // const fileName = import.meta.url.replace((/\\/g), '/').split('/').at(-1);  // Replace Windows Path And Get The Last Item
      const fileName = 'gtr.js';  // `Uncaught SyntaxError: Cannot use 'import.meta' outside a module` On Browser, So Use Anonym
      const type = 'Deno';
      const options = Deno.args;
      const exit0Function = () => Deno.exit(0);
      const exit1Function = () => Deno.exit(1);
      const { s, t, isVerbose, text } = parseOptions(fileName, type, options, exit0Function, exit1Function);
      
      const { url, userAgent } = createUrl(s, t, text);
      const result = await fetch(url, { headers: { 'User-Agent': userAgent } } ).then(response => response.text());
      showResult(result, isVerbose);
    })();
  }
  else if(typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.node !== 'undefined') {
    // Node.js
    (async () => {
      const fileName = require('path').basename(process.argv[1]);
      const type = 'Node.js';
      const options = process.argv.slice(2);
      const exit0Function = () => process.exit(0);
      const exit1Function = () => process.exit(1);
      const { s, t, isVerbose, text } = parseOptions(fileName, type, options, exit0Function, exit1Function);
      
      const { url, userAgent } = createUrl(s, t, text);
      
      const result = await new Promise((resolve, reject) => {
        const req = require('https').request(url, { headers: { 'User-Agent': userAgent } }, res => {
          res.setEncoding('utf8');
          let data = '';
          res.on('data', chunk => { data += chunk; })
             .on('end' , ()    => { resolve(data); });
        }).on('error'  , error => { reject(error); })
          .on('timeout', ()    => { req.destroy(); reject('Request Timeout'); })
          .setTimeout(10000)
          .end();
      });
      showResult(result, isVerbose);
    })();
  }
  else {
    throw new Error('Unknown Environment');
  }
})();

// {
//   sentences: [
//     {
//       trans: string;  // Translated Sentence
//       orig : string;  // Original Sentence
//       backend                      : number;
//       model_specification          : Array<*>;
//       translation_engine_debug_info: Array<*>;
//     }
//   ],
//   src: 'ja',  // Auto-Detect Source Language
//   confidence: 1,
//   spell: {},
//   ld_result: {
//     srclangs: ['ja'],
//     srclangs_confidences: [1],
///    extended_srclangs: ['ja']
//   }
// }
