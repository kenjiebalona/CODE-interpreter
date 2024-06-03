import Position from '../token/position';
import Token, { LookupIdent, TokenType } from '../token/token';

export default class Lexer {
  input: string;
  line: number = 1;
  column: number = 0;
  position: number = 0; // current position in input (points to current char)
  readPosition: number = 0; // current reading position in input (after current char)
  ch: string | number | null = null; // current char under examination

  constructor(input: string) {
    if (typeof input !== 'string') {
      throw new Error('Lexer: only `string` input allowed');
    }

    this.input = input;

    this.readChar();
  }

  NextToken() {
    let tok;

    this.skipWhitespace();

    let pos = new Position(this.position, this.line, this.column);

    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch; // ==
          tok = new Token(TokenType.EQ, literal, pos);
        } else {
          tok = new Token(TokenType.ASSIGN, this.ch, pos);
        }
        break;
      case '+':
        if (this.peekChar() === '+') {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch; // ++
          tok = new Token(TokenType.INCREMENT, literal, pos);
        } else {
          tok = new Token(TokenType.PLUS, this.ch, pos);
        }
        break;
      case '-':
        if (this.peekChar() === '-') {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch; // --
          tok = new Token(TokenType.DECREMENT, literal, pos);
        } else {
          tok = new Token(TokenType.MINUS, this.ch, pos);
        }
        break;
      case '!':
        tok = new Token(TokenType.BANG, this.ch, pos);
        break;
      case '/':
        tok = new Token(TokenType.SLASH, this.ch, pos);
        break;
      case '*':
        tok = new Token(TokenType.ASTERISK, this.ch, pos);
        break;
      case '%':
        tok = new Token(TokenType.REM, this.ch, pos);
        break;
      case '#':
        if (this.peekChar() === ']') {
          tok = new Token(TokenType.HASH, this.ch, pos);
        } else {
          tok = new Token(TokenType.COMMENT, this.readComment(), pos);
        }
        break;
      case '$':
        // if (this.peekChar() !== '&') {
        //   throw new Error('Syntax Error: Invalid token');
        // }
        tok = new Token(TokenType.NEWLINE, this.ch, pos);
        break;
      case '<':
        if (this.peekChar() === '=') {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch; // <=
          tok = new Token(TokenType.LTE, literal, pos);
        } else if (this.peekChar() === '>') {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch; // <>
          tok = new Token(TokenType.NOT_EQ, literal, pos);
        } else {
          tok = new Token(TokenType.LT, this.ch, pos);
        }
        break;
      case '>':
        if (this.peekChar() === '=') {
          let ch = this.ch;
          this.readChar();
          let literal = ch + this.ch; // >=
          tok = new Token(TokenType.GTE, literal, pos);
        } else {
          tok = new Token(TokenType.GT, this.ch, pos);
        }
        break;
      case '&':
        if(this.peekChar() === '#') {
          try {
            throw new Error('Syntax Error: Invalid token');
          } catch(err) {
            if (err instanceof Error) {
              console.log(err.message);
            } else {
              console.log('An unknown error occurred');
            }
          }
        }
        tok = new Token(TokenType.CONCAT, this.ch, pos);
        break;
      case '(':
        tok = new Token(TokenType.LPAREN, this.ch, pos);
        break;
      case ')':
        tok = new Token(TokenType.RPAREN, this.ch, pos);
        break;
      case '{':
        tok = new Token(TokenType.LBRACE, this.ch, pos);
        break;
      case '}':
        tok = new Token(TokenType.RBRACE, this.ch, pos);
        break;
      case '[':
        tok = new Token(TokenType.LBRACKET, this.ch, pos);
        break;
      case ']':
        tok = new Token(TokenType.RBRACKET, this.ch, pos);
        break;
      case ',':
        tok = new Token(TokenType.COMMA, this.ch, pos);
        break;
      case ';':
        tok = new Token(TokenType.SEMICOLON, this.ch, pos);
        break;
      case ':':
        tok = new Token(TokenType.COLON, this.ch, pos);
        break;
      case '"':
        if (this.peekChars(4) === 'TRUE') {
          tok = new Token(TokenType.TRUE, this.readString(), pos);
          break;
        } else if (this.peekChars(5) === 'FALSE') {
          tok = new Token(TokenType.FALSE, this.readString(), pos);
          break;
        } else {
          tok = new Token(TokenType.STRING, this.readString(), pos);
        }
        break;
      case "'":
        tok = new Token(TokenType.CHARACTER, this.readCharLiteral(), pos);
        break;
      case 0:
        tok = new Token(TokenType.EOF, '', pos);
        break;

      default:
        if (isLetter(this.ch)) {
          let literal = this.readIdentifier();
          try {
            if (literal === 'TRUE' || literal === 'FALSE') {
              throw new Error(
                'Syntax Error: TRUE and FALSE are reserved keywords'
              );
            }
          } catch(err) {
            if (err instanceof Error) {
              console.log(err.message);
            } else {
              console.log('An unknown error occurred');
            }
          }


          return new Token(LookupIdent(literal), literal, pos);
        } else if (isDigit(this.ch)) {
          let literal = this.readNumber();
          if (isFloat(literal)) {
            return new Token(TokenType.FLOATINGPOINT, literal, pos);
          }
          return new Token(TokenType.INTEGER, literal, pos);
        } else {
          tok = new Token(TokenType.ILLEGAL, '' + this.ch, pos);
        }
    }

    this.readChar();

    return tok;
  }

  skipWhitespace() {
    while (
      this.ch === ' ' ||
      this.ch === '\t' ||
      this.ch === '\n' ||
      this.ch === '\r'
    ) {
      this.readChar();
    }
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = 0;
    } else {
      this.ch = this.input[this.readPosition];
    }

    if (this.ch === '\n') {
      this.column = 0;
      this.line++;
    }

    this.position = this.readPosition;
    this.column++;
    this.readPosition++;
  }

  backupChar(pos: number) {
    this.position = pos;
    this.readPosition = pos;
    this.ch = this.input[this.readPosition];
  }

  readString(type: string = '"') {
    let position = this.position + 1;
    while (true) {
      this.readChar();
      if (this.ch === type || this.ch === 0) {
        break;
      }
    }
    return this.input.slice(position, this.position);
  }

  readCharLiteral(type: string = "'") {
    // let charLiteral = '';
    // this.readChar();

    // charLiteral += this.ch;

    // this.readChar();

    // if(this.ch !== type) {
    //   throw new Error('Unterminated character literal');
    // }

    // this.readChar();
    this.readChar();
    let charLiteral = '';
    while (this.ch !== "'" && this.ch !== '') {
      charLiteral += this.ch;
      this.readChar();
    }
    if (this.ch === "'") {
      this.readChar();
    } else {
      throw new Error('Syntax Error: Unclosed character literal.');
    }

    if (charLiteral.length > 1) {
      throw new Error('Syntax Error: Character literal is too long.');
    } else if (charLiteral.length === 0) {
      throw new Error('Syntax Error: Empty character literal.');
    }

    return charLiteral;
  }

  readComment() {
    let position = this.position + 1;
    while (true) {
      this.readChar();
      if (this.ch === '\n' || this.ch === '\r' || this.ch === 0) {
        break;
      }
    }
    return this.input.slice(position, this.position).trim();
  }

  peekChar() {
    if (this.readPosition >= this.input.length) {
      return 0;
    } else {
      return this.input[this.readPosition];
    }
  }

  peekChars(count: number = 1) {
    if (this.readPosition >= this.input.length) {
      return 0;
    } else {
      return this.input.slice(this.position + 1, this.readPosition + count); // +1 to skip the current char
    }
  }

  readIdentifier() {
    let position = this.position;
    while (isLetter(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  readNumber() {
    let position = this.position;
    while (isDigit(this.ch)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }
}

function isLetter(ch: string | number | null): boolean {
  if (!ch) return false;
  return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch === '_';
}

function isDigit(ch: string | number | null): boolean {
  if (!ch) return false;
  if (typeof ch === 'number') return true;
  return '0123456789.'.indexOf(ch) !== -1;
}

function isFloat(n: string): boolean {
  let val = parseFloat(n);
  return !isNaN(val) && /\d\.\d/.test(n);
}
