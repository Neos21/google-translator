# Google Translator

Inspired by [roj1512/gtr](https://github.com/roj1512/gtr).

```bash
# Bash Version
$ bash ./gtr.bash 'こんにちは'

# Node.js Version
$ node ./docs/gtr.js 'こんにちは'

# Deno Version
$ deno run --allow-net ./docs/gtr.js 'こんにちは'
```

- __[HTML Version](https://neos21.github.io/google-translator)__
- Common Options
    - `-s` : Source Language (Default : `auto`)
    - `-t` : Target Language (Default : `en`)
    - `-v`・`--verbose` : Print Raw Response For Debugging
    - `-h`・`--help` : Print Usage
- Examples
    - `$ bash ./gtr.bash -t 'ja' 'Hello'` → `こんにちは`
    - `$ bash ./gtr.bash -s 'en' -t 'zh-CN' 'Hello'` → `你好`


## Links

- [Neo's World](https://neos21.net/)
- [GitHub Pages - google-translator : Google Translator (HTML Version)](https://neos21.github.io/google-translator)
