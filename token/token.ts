import Position from "./position";

export default class Token {
  Type: string;
  Literal: string;
  Position: Position;

  constructor(type: string, literal: string, position?: Position) {
    this.Type = type;
    this.Literal = literal;
    this.Position = position || new Position(0, 0, 0);
  }
}

export type TokenTypeName = string;

export const TokenType: { [index: string]: TokenTypeName } = {
  ILLEGAL: 'ILLEGAL',
  EOF: 'EOF',
  COMMENT: 'COMMENT',
  // HASH: 'HASH',

  // Identifiers + literals
  IDENT: 'IDENT', // add, foobar, x, y, ...
  INTEGER: 'INTEGER', // 123456
  FLOATINGPOINT: 'FLOATINGPOINT', // 123.456
  STRING: 'STRING', // "foobar"
  CHARACTER: 'CHARACTER', // 'a'
  TRUE: 'TRUE',
  FALSE: 'FALSE',

  // Operators
  ASSIGN: '=',
  PLUS: '+',
  INCREMENT: '++',
  MINUS: '-',
  DECREMENT: '--',
  BANG: '!',
  ASTERISK: '*',
  SLASH: '/',
  REM: '%',
  LT: '<',
  GT: '>',
  LTE: '<=',
  GTE: '>=',
  EQ: '==',
  NOT_EQ: '<>',
  LAND: 'AND',
  LOR: 'OR',
  NOT: 'NOT',
  CONCAT: '&',
  NEWLINE: '$',

  // Delimiters
  COMMA: ',',
  SEMICOLON: ';',
  COLON: ':',

  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',
  LBRACKET: '[',
  RBRACKET: ']',

  // Keywords
  FUNCTION: 'FUNCTION',
  IF: 'IF',
  ELSE: 'ELSE',
  WHILE: 'WHILE',
  RETURN: 'RETURN',
  BEGIN: 'BEGIN',
  END: 'END',
  CODE: 'CODE',
  DISPLAY: 'DISPLAY',
  SCAN: 'SCAN',
  INT: 'INT',
  FLOAT: 'FLOAT',
  BOOL: 'BOOL',
  CHAR: 'CHAR',
};

export const Keywords: { [index: string]: string} = {
  FUNCTION: TokenType.FUNCTION,
  IF: TokenType.IF,
  ELSE: TokenType.ELSE,
  WHILE: TokenType.WHILE,
  RETURN: TokenType.RETURN,
  BEGIN: TokenType.BEGIN,
  END: TokenType.END,
  CODE: TokenType.CODE,
  DISPLAY: TokenType.DISPLAY,
  SCAN: TokenType.SCAN,
  INT: TokenType.INT,
  FLOAT: TokenType.FLOAT,
  BOOL: TokenType.BOOL,
  CHAR: TokenType.CHAR,
  AND: TokenType.LAND,
  OR: TokenType.LOR,
  NOT: TokenType.NOT,
  TRUE: TokenType.TRUE,
  FALSE: TokenType.FALSE,
}

export function LookupIdent(ident: string): string {
  if(Keywords[ident]) {
    return Keywords[ident];
  }
  return TokenType.IDENT;
}