import { TokenType } from '../token/token';
import Lexer from './lexer';
import Test from '../test';

export function TestLexer(t: Test) {
  console.log('║  └ TestNextToken');
  TestNextToken(t);
}

export function TestNextToken(t: Test) {
  let input = `
  WHILE(a < 4)
  BEGIN WHILE
    DISPLAY: a
    a = a + 1
  END WHILE
`;

  let tests = [
    [TokenType.WHILE, 'WHILE'],
    [TokenType.LPAREN, '('],
    [TokenType.IDENT, 'a'],
    [TokenType.LT, '<'],
    [TokenType.INTEGER, '4'],
    [TokenType.RPAREN, ')'],
    [TokenType.BEGIN, 'BEGIN'],
    [TokenType.WHILE, 'WHILE'],
    [TokenType.DISPLAY, 'DISPLAY'],
    [TokenType.COLON, ':'],
    [TokenType.IDENT, 'a'],
    [TokenType.IDENT, 'a'],
    [TokenType.ASSIGN, '='],
    [TokenType.IDENT, 'a'],
    [TokenType.PLUS, '+'],
    [TokenType.INTEGER, '1'],
    [TokenType.END, 'END'],
    [TokenType.WHILE, 'WHILE'],
    // [TokenType.EQ, '=='],
    // [TokenType.PLUS, '+'],
    // [TokenType.MINUS, '-'],
    // [TokenType.BANG, '!'],
    // [TokenType.SLASH, '/'],
    // [TokenType.ASTERISK, '*'],
    // [TokenType.REM, '%'],
    // [TokenType.NOT_EQ, '<>'],
    // [TokenType.NEWLINE, '$'],
    // [TokenType.CONCAT, '&'],
    // [TokenType.BEGIN, 'BEGIN'],
    // [TokenType.CODE, 'CODE'],
    // [TokenType.INT, 'INT'],
    // [TokenType.IDENT, 'x'],
    // [TokenType.ASSIGN, '='],
    // [TokenType.INTEGER, '5'],
    // [TokenType.BOOL, 'BOOL'],
    // [TokenType.IDENT, 's'],
    // [TokenType.ASSIGN, '='],
    // [TokenType.TRUE, 'TRUE'],
    // [TokenType.BOOL, 'BOOL'],
    // [TokenType.IDENT, 'z'],
    // [TokenType.ASSIGN, '='],
    // [TokenType.FALSE, 'FALSE'],
    // [TokenType.CHAR, 'CHAR'],
    // [TokenType.IDENT, 'y'],
    // [TokenType.ASSIGN, '='],
    // [TokenType.CHARACTER, 'A'],
    // [TokenType.TRUE, 'TRUE'],
    // [TokenType.FALSE, 'FALSE'],
    // [TokenType.END, 'END'],
    // [TokenType.CODE, 'CODE'],
    // [TokenType.TRUE, 'TRUE'],
    // [TokenType.FALSE, 'FALSE'],
    // [TokenType.TRUE, 'TRUE'],
    // [TokenType.FALSE, 'FALSE'],
    // [TokenType.CHARACTER, 'R'],
  ];

  let l = new Lexer(input);

  for (let i in tests) {
    let tt = tests[i];
    let tok = l.NextToken();

    t.Assert(tok.Type === tt[0], `tests[${i}] - type wrong. expected=${tt[0]}, got=${tok.Type}`);
    t.Assert(tok.Literal === tt[1], `tests[${i}] - literal wrong. expected=${tt[1]}, got=${tok.Literal}`);
  }
}

// export function TestNextToken(t: Test) {
//     let input = `
//   TRUE
//   FALSE
//   AND
//   OR
//   NOT
//   `;

//     let tests = [
//       [TokenType.TRUE, 'TRUE'],
//       [TokenType.FALSE, 'FALSE'],
//       [TokenType.LAND, 'AND'],
//       [TokenType.LOR, 'OR'],
//       [TokenType.NOT, 'NOT'],
//     ];

//     let l = new Lexer(input);

//     for (let i in tests) {
//       let tt = tests[i];
//       let tok = l.NextToken();

//       t.Assert(tok.Type === tt[0], `tests[${i}] - type wrong. expected=${tt[0]}, got=${tok.Type}`);
//       t.Assert(tok.Literal === tt[1], `tests[${i}] - literal wrong. expected=${tt[1]}, got=${tok.Literal}`);
//     }
//   }