// https://github.com/v8/v8/blob/7b455bf2b910202647f64758e40c5846bfe2806e/src/json/json-parser.h#L121
enum JSONTokenType {
  NUMBER,
  STRING,
  LBRACE,
  RBRACE,
  LBRACK,
  RBRACK,
  TRUE_LITERAL,
  FALSE_LITERAL,
  NULL_LITERAL,
  WHITESPACE,
  COLON,
  COMMA,
  ILLEGAL,
  EOS,
}

interface Token {
  type: JSONTokenType;
}

interface PrimitiveToken extends Token {
  type: JSONTokenType.NUMBER;
  value: number | string | true | false | null;
}

// https://github.com/microsoft/TypeScript/blob/90e15549fe742c2a74e44387f2d8fab42e324873/src/compiler/types.ts#L6307
enum CharacterCodes {
  nullCharacter = 0,
  maxAsciiCharacter = 0x7f,

  lineFeed = 0x0a, // \n
  carriageReturn = 0x0d, // \r
  lineSeparator = 0x2028,
  paragraphSeparator = 0x2029,
  nextLine = 0x0085,

  // Unicode 3.0 space characters
  space = 0x0020, // " "
  nonBreakingSpace = 0x00a0, //
  enQuad = 0x2000,
  emQuad = 0x2001,
  enSpace = 0x2002,
  emSpace = 0x2003,
  threePerEmSpace = 0x2004,
  fourPerEmSpace = 0x2005,
  sixPerEmSpace = 0x2006,
  figureSpace = 0x2007,
  punctuationSpace = 0x2008,
  thinSpace = 0x2009,
  hairSpace = 0x200a,
  zeroWidthSpace = 0x200b,
  narrowNoBreakSpace = 0x202f,
  ideographicSpace = 0x3000,
  mathematicalSpace = 0x205f,
  ogham = 0x1680,

  _ = 0x5f,
  $ = 0x24,

  _0 = 0x30,
  _1 = 0x31,
  _2 = 0x32,
  _3 = 0x33,
  _4 = 0x34,
  _5 = 0x35,
  _6 = 0x36,
  _7 = 0x37,
  _8 = 0x38,
  _9 = 0x39,

  a = 0x61,
  b = 0x62,
  c = 0x63,
  d = 0x64,
  e = 0x65,
  f = 0x66,
  g = 0x67,
  h = 0x68,
  i = 0x69,
  j = 0x6a,
  k = 0x6b,
  l = 0x6c,
  m = 0x6d,
  n = 0x6e,
  o = 0x6f,
  p = 0x70,
  q = 0x71,
  r = 0x72,
  s = 0x73,
  t = 0x74,
  u = 0x75,
  v = 0x76,
  w = 0x77,
  x = 0x78,
  y = 0x79,
  z = 0x7a,

  ampersand = 0x26, // &
  asterisk = 0x2a, // *
  at = 0x40, // @
  backslash = 0x5c, // \
  backtick = 0x60, // `
  bar = 0x7c, // |
  caret = 0x5e, // ^
  closeBrace = 0x7d, // }
  closeBracket = 0x5d, // ]
  closeParen = 0x29, // )
  colon = 0x3a, // :
  comma = 0x2c, // ,
  dot = 0x2e, // .
  doubleQuote = 0x22, // "
  equals = 0x3d, // =
  exclamation = 0x21, // !
  greaterThan = 0x3e, // >
  hash = 0x23, // #
  lessThan = 0x3c, // <
  minus = 0x2d, // -
  openBrace = 0x7b, // {
  openBracket = 0x5b, // [
  openParen = 0x28, // (
  percent = 0x25, // %
  plus = 0x2b, // +
  question = 0x3f, // ?
  semicolon = 0x3b, // ;
  singleQuote = 0x27, // '
  slash = 0x2f, // /
  tilde = 0x7e, // ~

  backspace = 0x08, // \b
  formFeed = 0x0c, // \f
  byteOrderMark = 0xfeff,
  tab = 0x09, // \t
  verticalTab = 0x0b, // \v
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pickJSON(text: string, _keypaths: string[]): any {
  let pos = 0;
  // let startPos = 0;
  // let tokenPos = 0;
  const end = text.length;

  // const tokens: Token[] = [];
  // let currentToken = nextToken();
  // while(currentToken.type !== JSONTokenType.EOS) {
  //   tokens.push(currentToken);
  //   currentToken = nextToken();
  // }

  // return tokens;

  let currentToken = nextToken();

  return parseValue();

  function parseValue() {
    switch (currentToken.type) {
      case JSONTokenType.NUMBER:
      case JSONTokenType.STRING:
      case JSONTokenType.TRUE_LITERAL:
      case JSONTokenType.FALSE_LITERAL:
      case JSONTokenType.NULL_LITERAL:
        return (advance() as PrimitiveToken).value;
      case JSONTokenType.LBRACE:
        advance();
        return parseObject();
      case JSONTokenType.LBRACK:
        advance();
        return parseArray();
      default:
        error();
    }
  }

  function parseArray(): unknown[] {
    const array = [];
    while (currentToken.type !== JSONTokenType.RBRACK) {
      array.push(parseValue());
      parseOptional(JSONTokenType.COMMA);
    }
    advance();
    return array;
  }

  function parseObject(): Record<string, unknown> {
    const object: Record<string, unknown> = {};
    while (currentToken.type !== JSONTokenType.RBRACE) {
      const key = parseExpected(JSONTokenType.STRING) as PrimitiveToken;
      parseExpected(JSONTokenType.COLON);
      const value = parseValue();
      parseOptional(JSONTokenType.COMMA);

      object[key.value as string] = value;
    }

    advance();

    return object;
  }

  function advance() {
    const token = currentToken;
    currentToken = nextToken();
    return token;
  }

  function parseOptional(_type: JSONTokenType) {
    if (currentToken.type === _type) {
      advance();
      return true;
    }

    return false;
  }

  function parseExpected(_type: JSONTokenType) {
    // TODO: maybe check type
    if (currentToken.type !== _type) {
      error();
    }
    const token = currentToken;
    advance();
    return token;
  }

  function nextToken(): Token {
    // startPos = pos;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // tokenPos = pos;
      if (pos >= end) {
        return createToken(JSONTokenType.EOS);
      }
      const ch = text.codePointAt(pos);

      switch (ch) {
        case CharacterCodes.openBrace:
          pos++;
          return createToken(JSONTokenType.LBRACE);
        case CharacterCodes.closeBrace:
          pos++;
          return createToken(JSONTokenType.RBRACE);
        case CharacterCodes.openBracket:
          pos++;
          return createToken(JSONTokenType.LBRACK);
        case CharacterCodes.closeBracket:
          pos++;
          return createToken(JSONTokenType.RBRACK);
        case CharacterCodes.colon:
          pos++;
          return createToken(JSONTokenType.COLON);
        case CharacterCodes.comma:
          pos++;
          return createToken(JSONTokenType.COMMA);
        case CharacterCodes.doubleQuote:
          return createToken(JSONTokenType.STRING, scanString());
        case CharacterCodes.minus:
        case CharacterCodes._0:
        case CharacterCodes._1:
        case CharacterCodes._2:
        case CharacterCodes._3:
        case CharacterCodes._4:
        case CharacterCodes._5:
        case CharacterCodes._6:
        case CharacterCodes._7:
        case CharacterCodes._8:
        case CharacterCodes._9:
          return createToken(JSONTokenType.NUMBER, scanNumber());
        case CharacterCodes.t:
          if (
            CharacterCodes.r === text.codePointAt(++pos) &&
            CharacterCodes.u === text.codePointAt(++pos) &&
            CharacterCodes.e === text.codePointAt(++pos)
          ) {
            pos++;
            return createToken(JSONTokenType.TRUE_LITERAL, true);
          } else {
            error();
          }
        case CharacterCodes.f:
          if (
            CharacterCodes.a === text.codePointAt(++pos) &&
            CharacterCodes.l === text.codePointAt(++pos) &&
            CharacterCodes.s === text.codePointAt(++pos) &&
            CharacterCodes.e === text.codePointAt(++pos)
          ) {
            pos++;
            return createToken(JSONTokenType.FALSE_LITERAL, false);
          } else {
            error();
          }
        case CharacterCodes.n:
          if (
            CharacterCodes.u === text.codePointAt(++pos) &&
            CharacterCodes.l === text.codePointAt(++pos) &&
            CharacterCodes.l === text.codePointAt(++pos)
          ) {
            pos++;
            return createToken(JSONTokenType.NULL_LITERAL, null);
          } else {
            error();
          }
        case CharacterCodes.space:
        case CharacterCodes.tab:
        case CharacterCodes.lineFeed:
        case CharacterCodes.carriageReturn:
          // TODO: maybe return JSONTokenType.WHITESPACE
          pos++;
          continue;
      }
    }
  }

  function createToken(
    type: JSONTokenType,
    value?: string | number | boolean | null
  ) {
    return {
      type,
      value,
    };
  }

  function scanString() {
    pos++;
    let start = pos;
    let result = "";

    while (true) {
      if (pos >= end) {
        unexpectedEOS();
      }
      const ch = text.charCodeAt(pos);
      if (ch === CharacterCodes.doubleQuote) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === CharacterCodes.backslash) {
        result += text.substring(start, pos);
        result += scanEscapeSequence();
        start = pos;
        continue;
      }
      // TODO: maybe handle line breaks
      pos++;
    }

    return result;
  }

  function scanNumber(): number {
    const start = pos;
    pos++;
    while (true) {
      const ch = text.codePointAt(pos)!;
      if (
        (CharacterCodes._0 <= ch && ch <= CharacterCodes._9) ||
        ch === CharacterCodes.minus ||
        ch === CharacterCodes.dot ||
        ch === CharacterCodes.e
      ) {
        pos++;
      } else {
        break;
      }
    }

    return +text.substring(start, pos);
  }

  function error(): never {
    throw new SyntaxError(`unexpected input at ${pos}.`);
  }

  function unexpectedEOS(): never {
    throw new Error("unexpected end of input");
  }

  function scanEscapeSequence() {
    pos++;
    if (pos >= end) {
      unexpectedEOS();
    }
    const ch = text.charCodeAt(pos);
    pos++;
    switch (ch) {
      case CharacterCodes.doubleQuote:
        return '"';
      case CharacterCodes.backslash:
        return "\\";
      case CharacterCodes.slash:
        return "/";
      case CharacterCodes.b:
        return "\b";
      case CharacterCodes.f:
        return "\f";
      case CharacterCodes.n:
        return "\n";
      case CharacterCodes.r:
        return "\r";
      case CharacterCodes.t:
        return "\t";
      case CharacterCodes.u:
        pos += 4;
        // TODO: maybe check invalid chars
        return String.fromCharCode(parseInt(text.substring(pos - 4, pos), 16));
      default:
        error();
    }
  }
}
