import { ASTProgram, BlockStatement, INTStatement, Identifier, WhileLiteral } from './ast';
import Token, { TokenType } from '../token/token';
import Test from '../test';

export function TestAst(t: Test) {
  console.log('║  └ TestString');
  TestString(t);
}

export function TestString(t: Test) {
  let program = new ASTProgram();
  program.Statements = [
    new INTStatement(
      new Token(TokenType.INT, 'INT'),
      new Identifier(new Token(TokenType.IDENT, 'myVar'), 'myVar'),
      new Identifier(new Token(TokenType.IDENT, 'anotherVar'), 'anotherVar')
    ),
  ];

  t.Assert(
    program.String() === 'INT myVar = anotherVar;',
    'program.String() wrong. got=%s',
    program.String()
  );
}