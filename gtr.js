// ================================================================================
// Google Translator (Node.js Version)
// ================================================================================

const https = require('https');

const request = (url, options = {}) => new Promise((resolve, reject) => {
  const req = https.request(url, options, res => {
    res.setEncoding('utf8');
    let data = '';
    res.on('data', chunk => { data += chunk; })
       .on('end' , ()    => { resolve(data); });
  }).on('error'  , error => { reject(error); })
    .on('timeout', ()    => { req.destroy(); reject('Request Timeout'); })
    .setTimeout(10000)
    .end();
});

(async () => {
  // TODO : Parse Options
  const text = 'こんにちは世界';
  const sourceLanguage = 'auto';  // Default : 'auto' (Auto-Detect)
  const targetLanguage = 'en';    // Default : 'en'
  
  const params = new URLSearchParams({
    q : text,
    sl: sourceLanguage,  // Source Language
    tl: targetLanguage,  // Target Language
    ie: 'utf-8',  // Input Encoding
    oe: 'utf-8',  // Output Encoding
    dt: 't',
    dj: '1',
    client: 'gtx'  // Translate Client
  }).toString();
  const response = await request(`https://translate.googleapis.com/translate_a/single?${params}`, {
    headers: { 'User-Agent': 'GoogleTranslate/6.6.1.RC09.302039986 (Linux; U; Android 9; Redmi Note 8)' }
  });
  const json = JSON.parse(response);
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
  
  console.log({
    original  : json.sentences.map(sentence => sentence.orig).join(''),
    translated: json.sentences.map(sentence => sentence.trans).join(''),
    sourceLanguage: json.src,
    targetLanguage: targetLanguage
  });
})();
