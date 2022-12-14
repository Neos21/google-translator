#!/bin/bash

# ================================================================================
# Google Translator (Bash Version)
# ================================================================================

function usage() {
  local file_name="$(basename $0)"
  cat << EOL

${file_name} - Google Translator (Bash Version)

Usage: ${file_name} [options] <text>

Arguments:
  text  Text To Translate

Options:
  -s <string>    Source Language (Default 'auto')
  -t <string>    Target Language (Default 'en')
  -v, --verbose  Print Raw Response For Debugging
  -h, --help     Print This Usage And Quit

Examples:
    $ ${file_name} 'こんにちは'
    hello
    $ ${file_name} -t 'ja' 'Hello'
    こんにちは
    $ ${file_name} -s 'en' -t 'zh-CN' 'Hello'
    你好
EOL
}

function invalid() {
  usage 1>&2
  echo ''
  echo "Invalid : $@" 1>&2
  exit 1
}

if !(type 'curl' > /dev/null 2>&1); then
  invalid 'This Script Requires '\''curl'\'' Command'
  exit 1
fi
if !(type 'jq' > /dev/null 2>&1); then
  invalid 'This Script Requires '\''jq'\'' Command'
  exit 1
fi

s=''              # Source Language
t=''              # Target Language
text=''           # Text To Translate
is_verbose=false  # Is Verbose Mode

# Parse Options : https://gist.github.com/kawarimidoll/371ee1741897608b945c8338b7a75ac3
while (( $# > 0 )); do
  case "$1" in
    '-h' | '--help')
      usage
      exit 0
      ;;
    '-v' | '--verbose' )
      is_verbose=true
      ;;
    '-s' )
      if [ -z "$2" ]; then
        invalid "'-s' (Source Language) Requires An Argument"
        exit 1
      fi
      s="$2"
      shift
      ;;
    '-t' )
      if [ -z "$2" ]; then
        invalid "'-t' (Target Language) Requires An Argument"
        exit 1
      fi
      t="$2"
      shift
      ;;
    -* )
      invalid "Illegal Option -- '$1'"
      exit 1
      ;;
    * )
      text="$1"
      ;;
  esac
  shift
done
if [ -z "${text}" ]; then
  invalid 'Please Input Text'
  exit 1
fi
#echo "-s [${s}] : -t [${t}] : -v [${is_verbose}] : text [${text}]"

function create_url() {
  local source_language="${1:-auto}"  # 1st Argument or Default 'auto'
  local target_language="${2:-en}"    # 2nd Argument or Default 'en'
  local url='https://translate.googleapis.com/translate_a/single'
  local params="?sl=${source_language}&tl=${target_language}&ie=utf-8&oe=utf-8&dt=t&dj=1&client=gtx&q="
  echo "${url}${params}"  # Join The Encoded Text After This
}

function create_utf8_code() {
  local code="$(echo -n "$1" | xxd -ps)"
  local length="${#code}"
  local i
  for (( i = 0; i < length; i += 2 )); do
    echo -n "%${code:$i:2}" | tr '[:lower:]' '[:upper:]'
  done
}

function encode_uri_component() {
  local text="${1}"
  local length="${#text}"
  local i char
  for (( i = 0; i < length; ++i )); do
    char="${text:$i:1}"
    [[ "${char}" =~ [-_.!~*\'()a-zA-Z0-9] ]] && echo -n "${char}" || create_utf8_code "${char}"
  done
}

# URL
url="$(create_url "${s}" "${t}")"
# "$(node -p "encodeURIComponent('Text')")" : https://dirask.com/posts/Bash-JavaScript-encodeURIComponent-equivalent-DKo8xD
encoded_text="$(encode_uri_component "${text}")"

# curl : -sS -A
result="$(curl --silent --show-error --user-agent 'GoogleTranslate/6.6.1.RC09.302039986 (Linux; U; Android 9; Redmi Note 8)' "${url}${encoded_text}")"
# Verbose Mode
if "${is_verbose}"; then
  echo 'Raw Response :'
  echo "${result}" | jq '.' 2> /dev/null || echo "${result}"
  echo ''
fi
# jq : -j
echo "${result}" | jq --join-output '.sentences[].trans + "\n"' 2> /dev/null || cat <<EOL
Parse Error :
${result}
EOL
