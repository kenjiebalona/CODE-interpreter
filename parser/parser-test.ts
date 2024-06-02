import Lexer from '../lexer/lexer';
import Parser from './parser';
import Test from '../test';
import {
  AstBoolean,
  CallExpression,
  Expression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  INTStatement,
  PrefixExpression,
  ReturnStatement,
  Statement,
  StringLiteral,
} from '../ast/ast';

export function TestParser(t: Test) {
  // console.log('║  ├ TestIntStatements');
  // TestIntStatements(t);
  // console.log('║  ├ TestReturnStatements');
  // TestReturnStatements(t);
  // console.log('║  ├ TestIdentifierExpression');
  // TestIdentifierExpression(t);
  // console.log('║  ├ TestIntegerExpression');
  // TestIntegerExpression(t);
  // console.log('║  ├ TestStringLiteralExpression');
  // TestStringLiteralExpression(t);
  // console.log('║  ├ TestParsingPrefixExpressions');
  // TestParsingPrefixExpressions(t);
  // console.log('║  ├ TestParsingInfixExpressions');
  // TestParsingInfixExpressions(t);
  // console.log('║  ├ TestOperatorPrecedenceParsing');
  // TestOperatorPrecedenceParsing(t);
  // console.log('║  ├ TestBooleanExpression');
  // TestBooleanExpression(t);
  console.log('║  ├ TestIfExpression');
  TestIfExpression(t);
  console.log('║  ├ TestIfElseExpression');
  TestIfElseExpression(t);
  // console.log('║  ├ TestFunctionLiteralParsing');
  // TestFunctionLiteralParsing(t);
  // console.log('║  ├ TestFunctionParameterParsing');
  // TestFunctionParameterParsing(t);
  // console.log('║  ├ TestCallExpressionParsing');
  // TestCallExpressionParsing(t);
  // console.log('║  ├ TestParsingArrayLiterals');
  // TestParsingArrayLiterals(t);
  // console.log('║  ├ TestParsingIndexExpressions');
  // TestParsingIndexExpressions(t);
  // console.log('║  ├ TestParsingHashLiteralsStringKeys');
  // TestParsingHashLiteralsStringKeys(t);
  // console.log('║  ├ TestParsingEmptyHashLiterals');
  // TestParsingEmptyHashLiterals(t);
  // console.log('║  └ TestParsingHashLiteralsWithExpressions');
  // TestParsingHashLiteralsWithExpressions(t);
}

function TestIntStatements(t: Test) {
  let tests = [
    { input: 'INT x = 5', expectedIdentifier: 'x', expectedValue: 5 },
    { input: 'INT y = 12', expectedIdentifier: 'y', expectedValue: 12 },
    { input: 'INT foobar = 3', expectedIdentifier: 'foobar', expectedValue: 3 },
  ];

  for (let i in tests) {
    let tt = tests[i];

    let l = new Lexer(tt.input);
    let p = new Parser(l);
    let program = p.ParseProgram();
    checkParserErrors(t, p);

    t.Assert(program !== null, 'ParseProgram() returned nil');
    t.Assert(
      program.Statements.length === 1,
      'program.Statements does not contain 3 statements. got=%d',
      program.Statements.length
    );

    let stmt = program.Statements[0];
    if (!testINTStatement(t, stmt, tt.expectedIdentifier)) {
      continue;
    }

    if (!(stmt instanceof INTStatement)) {
      t.Errorf(`s not got=LetStatement. got=${typeof stmt}`);
      continue;
    }

    // // let val = stmt.Value;
    // if (!testLiteralExpression(t, val, tt.expectedValue)) {
    //   continue;
    // }
  }
}

function TestStringLiteralExpression(t: Test) {
  let input = '"hello world"';

  let l = new Lexer(input);
  let p = new Parser(l);
  let program = p.ParseProgram();
  checkParserErrors(t, p);

  t.Assert(
    program.Statements.length === 1,
    'program.Statements does not contain 1 statements. got=%d',
    program.Statements.length
  );
  let stmt = program.Statements[0];
  if (!(stmt instanceof ExpressionStatement)) {
    t.Errorf(
      'program.Statements[0] not type ExpressionStatement. got=%s',
      typeof stmt
    );
    return;
  }

  let literal = stmt.Expression;
  if (!(literal instanceof StringLiteral)) {
    t.Errorf('exp not type StringLiteral. got=%s', typeof literal);
    return;
  }

  t.Assert(
    literal.Value === 'hello world',
    'literal.Value is not "hello world". got=%s',
    literal.Value
  );
  t.Assert(
    literal.TokenLiteral() === 'hello world',
    'literal.TokenLiteral is not "hello world". got=%s',
    literal.TokenLiteral()
  );
}

function TestOperatorPrecedenceParsing(t: Test) {
  let tests = [
    ['-a * b', '((-a) * b)'],
    ['!-a', '(!(-a))'],
    ['a + b + c', '((a + b) + c)'],
    ['a + b - c', '((a + b) - c)'],
    ['a * b * c', '((a * b) * c)'],
    ['a * b / c', '((a * b) / c)'],
    ['a + b / c', '(a + (b / c))'],
    ['a + b * c + d / e - f', '(((a + (b * c)) + (d / e)) - f)'],
    ['3 + 4; -5 * 5', '(3 + 4)((-5) * 5)'],
    ['5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))'],
    ['5 < 4 <> 3 > 4', '((5 < 4) <> (3 > 4))'],
    ['3 + 4 * 5 == 3 * 1 + 4 * 5', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],
    ['TRUE', 'TRUE'],
    ['FALSE', 'FALSE'],
    ['3 > 5 == FALSE', '((3 > 5) == FALSE)'],
    ['3 < 5 == FALSE', '((3 < 5) == FALSE)'],
    ['1 + (2 + 3) + 4', '((1 + (2 + 3)) + 4)'],
    ['(5 + 5) * 2', '((5 + 5) * 2)'],
    ['2 / (5 + 5)', '(2 / (5 + 5))'],
    ['(5 + 5) * 2 * (5 + 5)', '(((5 + 5) * 2) * (5 + 5))'],
    ['-(5 + 5)', '(-(5 + 5))'],
    ['!(FALSE == FALSE)', '(!(FALSE == FALSE))'],
    ['a + add(b * c) + d', '((a + add((b * c))) + d)'],
    [
      'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
      'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
    ],
    ['add(a + b + c * d / f + g)', 'add((((a + b) + ((c * d) / f)) + g))'],
    // ['a * [1, 2, 3, 4][b * c] * d', '((a * ([1, 2, 3, 4][(b * c)])) * d)'],
    // ['add(a * b[2], b[1], 2 * [1, 2][1])', 'add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))'],
  ];

  for (let i in tests) {
    let tt = tests[i];

    let l = new Lexer(tt[0]);
    let p = new Parser(l);
    let program = p.ParseProgram();
    checkParserErrors(t, p);

    let actual = program.String();
    t.Assert(
      actual === tt[1],
      'operator precedence expected=%s got=%s',
      tt[1],
      actual
    );
  }
}

function TestReturnStatements(t: Test) {
  let input = `
RETURN 5;
RETURN 10;
RETURN 838383;
`;

  let l = new Lexer(input);
  let p = new Parser(l);
  let program = p.ParseProgram();
  checkParserErrors(t, p);

  t.Assert(program !== null, 'ParseProgram() returned nil');
  t.Assert(
    program.Statements.length === 3,
    'program.Statements does not contain 3 statements. got=%d',
    program.Statements.length
  );

  for (let stmt of program.Statements) {
    t.Assert(
      stmt instanceof ReturnStatement,
      'stmt not type ReturnStatement. got=%s',
      typeof stmt
    );
    t.Assert(
      stmt.TokenLiteral() === 'RETURN',
      'stmt.TokenLiteral not "RETURN". got=%s',
      stmt.TokenLiteral()
    );
  }
}

function TestIdentifierExpression(t: Test) {
  let input = 'foobar';

  let l = new Lexer(input);
  let p = new Parser(l);
  let program = p.ParseProgram();
  checkParserErrors(t, p);

  t.Assert(
    program.Statements.length === 1,
    'program.Statements does not contain 1 statements. got=%d',
    program.Statements.length
  );
  let stmt = program.Statements[0];
  if (!(stmt instanceof ExpressionStatement)) {
    t.Errorf('program.Statements[0] not type ExpressionStatement. got=%s', typeof stmt);
    return;
  }

  let ident = stmt.Expression;
  if (!(ident instanceof Identifier)) {
    t.Errorf('exp not type Identifier. got=%s', typeof ident);
    return;
  }

  t.Assert(ident.Value === 'foobar', 'ident.Value is not "foobar". got=%s', ident.Value);
  t.Assert(
    ident.TokenLiteral() === 'foobar',
    'ident.TokenLiteral is not "foobar". got=%s',
    ident.TokenLiteral()
  );
}

function TestParsingPrefixExpressions(t: Test) {
  let prefixTests = [
    { input: '!5', operator: '!', value: 5 },
    { input: '-15', operator: '-', value: 15 },
    { input: '!TRUE', operator: '!', value: 'FALSE' },
    { input: '!TRUE', operator: '!', value: 'FALSE' },
  ];

  for (let i in prefixTests) {
    let tt = prefixTests[i];

    let l = new Lexer(tt.input);
    let p = new Parser(l);
    let program = p.ParseProgram();
    checkParserErrors(t, p);

    t.Assert(
      program.Statements.length === 1,
      'program.Statements does not contain 1 statements. got=%d',
      program.Statements.length
    );
    let stmt = program.Statements[0];
    if (!(stmt instanceof ExpressionStatement)) {
      t.Errorf('program.Statements[0] not type ExpressionStatement. got=%s', typeof stmt);
      continue;
    }

    let exp = stmt.Expression;
    if (!(exp instanceof PrefixExpression)) {
      t.Errorf('stmt not type PrefixExpression. got=%s', typeof exp);
      continue;
    }

    t.Assert(exp.Operator === tt.operator, 'exp.Operator is not %s. got=%s', tt.operator, exp.Operator);

    if (!testLiteralExpression(t, exp.Right, tt.value)) {
      continue;
    }
  }
}

function TestParsingInfixExpressions(t: Test) {
  let infixTests = [
    { input: '5 + 5;', leftValue: 5, operator: '+', rightValue: 5 },
    { input: '5 - 5;', leftValue: 5, operator: '-', rightValue: 5 },
    { input: '5 * 5;', leftValue: 5, operator: '*', rightValue: 5 },
    { input: '5 / 5;', leftValue: 5, operator: '/', rightValue: 5 },
    { input: '5 > 5;', leftValue: 5, operator: '>', rightValue: 5 },
    { input: '5 < 5;', leftValue: 5, operator: '<', rightValue: 5 },
    { input: '5 == 5;', leftValue: 5, operator: '==', rightValue: 5 },
    { input: '5 <> 5;', leftValue: 5, operator: '<>', rightValue: 5 },
    { input: 'TRUE == TRUE', leftValue: true, operator: '==', rightValue: true },
    { input: 'TRUE <> FALSE', leftValue: true, operator: '<>', rightValue: false },
    { input: 'FALSE == FALSE', leftValue: false, operator: '==', rightValue: false },
  ];

  for (let i in infixTests) {
    let tt = infixTests[i];

    let l = new Lexer(tt.input);
    let p = new Parser(l);
    let program = p.ParseProgram();
    checkParserErrors(t, p);

    t.Assert(
      program.Statements.length === 1,
      'program.Statements does not contain 1 statements. got=%d',
      program.Statements.length
    );

    let stmt = program.Statements[0];
    if (!(stmt instanceof ExpressionStatement)) {
      t.Errorf('program.Statements[0] not type ExpressionStatement. got=%s', typeof stmt);
      continue;
    }

    if (!testInfixExpression(t, stmt.Expression, tt.leftValue, tt.operator, tt.rightValue)) {
      continue;
    }
  }
}

function TestBooleanExpression(t: Test) {
  let tests = [{ input: 'TRUE', expected: true }, { input: 'FALSE', expected: false }];

  for (let i in tests) {
    let tt = tests[i];

    let l = new Lexer(tt.input);
    let p = new Parser(l);
    let program = p.ParseProgram();
    checkParserErrors(t, p);

    t.Assert(
      program.Statements.length === 1,
      'program.Statements does not contain 1 statements. got=%d',
      program.Statements.length
    );

    let stmt = program.Statements[0];
    if (!(stmt instanceof ExpressionStatement)) {
      t.Errorf('program.Statements[0] not type ExpressionStatement. got=%s', typeof stmt);
      continue;
    }

    let boolean = stmt.Expression;
    if (!(boolean instanceof AstBoolean)) {
      t.Errorf('exp not type AstBoolean. got=%s', typeof boolean);
      continue;
    }
    t.Assert(boolean.Value === tt.expected, 'boolean.Value is not %s. got=%s', tt.expected, boolean.Value);
  }
}

function TestIfExpression(t: Test) {
  let input = `IF (x < y)
  BEGIN IF
  x
  END IF`;

  let l = new Lexer(input);
  let p = new Parser(l);
  let program = p.ParseProgram();
  checkParserErrors(t, p);

  t.Assert(
    program.Statements.length === 1,
    'program.Statements does not contain 1 statements. got=%d',
    program.Statements.length
  );
  let stmt = program.Statements[0];
  if (!(stmt instanceof ExpressionStatement)) {
    t.Errorf('program.Statements[0] not type ExpressionStatement. got=%s', typeof stmt);
    return;
  }

  let exp = stmt.Expression;
  if (!(exp instanceof IfExpression)) {
    t.Errorf('stmt.Expression is not type IfExpression. got=%s', typeof exp);
    return;
  }

  if (!testInfixExpression(t, exp.Condition, 'x', '<', 'y')) {
    return;
  }

  t.Assert(
    exp.Consequence.Statements.length === 1,
    'consequence is no 1 statements. got=%s',
    exp.Consequence.Statements.length
  );

  let consequence = exp.Consequence.Statements[0];
  if (!(consequence instanceof ExpressionStatement)) {
    t.Errorf('Statements[0] is not ExpressionStatement. got=%s', typeof consequence);
    return;
  }

  if (!testIdentifier(t, consequence.Expression, 'x')) {
    return;
  }

  t.Assert(exp.Alternative === null, 'exp.Alternative.Statements was not null. got=%s', exp.Alternative);
}

function TestIfElseExpression(t: Test) {
  let input = `
  IF (x < y)
  BEGIN IF
  x
  END IF
  ELSE
  BEGIN IF
  y
  END IF
  `

  let l = new Lexer(input);
  let p = new Parser(l);
  let program = p.ParseProgram();
  checkParserErrors(t, p);

  t.Assert(
    program.Statements.length === 1,
    'program.Statements does not contain 1 statements. got=%d',
    program.Statements.length
  );
  let stmt = program.Statements[0];
  if (!(stmt instanceof ExpressionStatement)) {
    t.Errorf('program.Statements[0] not type ExpressionStatement. got=%s', typeof stmt);
    return;
  }

  let exp = stmt.Expression;
  if (!(exp instanceof IfExpression)) {
    t.Errorf('stmt.Expression is not type IfExpression. got=%s', typeof exp);
    return;
  }

  if (!testInfixExpression(t, exp.Condition, 'x', '<', 'y')) {
    return;
  }

  t.Assert(
    exp.Consequence.Statements.length === 1,
    'consequence is not 1 statements. got=%s',
    exp.Consequence.Statements.length
  );

  let consequence = exp.Consequence.Statements[0];
  if (!(consequence instanceof ExpressionStatement)) {
    t.Errorf('Statements[0] is not ExpressionStatement. got=%s', typeof consequence);
    return;
  }

  if (!testIdentifier(t, consequence.Expression, 'x')) {
    return;
  }

  if (!exp.Alternative) {
    t.Errorf('exp missing Alternative. got=%s', exp.Alternative);
    return;
  }

  t.Assert(
    exp.Alternative.Statements.length === 1,
    'exp.Alternative.Statements does not contain 1 statements. got=%s',
    exp.Alternative.Statements.length
  );

  let alternative = exp.Alternative.Statements[0];
  if (!(alternative instanceof ExpressionStatement)) {
    t.Errorf('Statements[0] is not ExpressionStatement. got=%s', typeof alternative);
    return;
  }

  if (!testIdentifier(t, alternative.Expression, 'y')) {
    return;
  }
}

function checkParserErrors(t: Test, p: Parser) {
  let errors = p.Errors();
  if (errors.length === 0) return;

  t.Errorf('parser has %d errors', errors.length);

  for (let err of errors) {
    t.Errorf('parser error: %s', err);
  }

  t.FailNow();
}

function testLiteralExpression(
  t: Test,
  exp: Expression,
  expected: any
): boolean {
  if (typeof expected === 'number') {
    return testIntegerLiteral(t, exp, expected);
  } else if (typeof expected === 'string') {
    return testIdentifier(t, exp, expected);
  } else if (typeof expected === 'boolean') {
    return testBooleanLiteral(t, exp, expected);
  }

  t.Errorf(
    'type of expected (%s) not handled. got=%s',
    typeof expected,
    exp.constructor.name
  );
  return false;
}

function testIntegerLiteral(t: Test, il: Expression, value: Number): boolean {
  let integ = il;
  let ok;

  if (!(integ instanceof IntegerLiteral)) {
    t.Errorf('il not type IntegerLiteral. got=%s', il.constructor.name);
    return false;
  }

  ok = integ.Value === value;
  if (!ok) {
    t.Assert(ok, 'integ.Value is not %s. got=%s', value, integ.Value);
    return false;
  }

  ok = integ.TokenLiteral() === '' + value; // is a string
  if (!ok) {
    t.Assert(
      ok,
      'integ.TokenLiteral is not "%s". got=%s',
      '' + value,
      integ.TokenLiteral()
    );
    return false;
  }

  return true;
}

function testIdentifier(t: Test, exp: Expression, value: String): boolean {
  let ident = exp;

  if (!(ident instanceof Identifier)) {
    t.Errorf('exp is not Identifier. got=%s', exp);
    return false;
  }

  if (ident.Value !== value) {
    t.Errorf('ident.Value is not %s. got=%s', value, ident.Value);
    return false;
  }

  if (ident.TokenLiteral() !== '' + value) {
    t.Errorf(
      'ident.TokenLiteral is not %s. got=%s',
      value,
      ident.TokenLiteral()
    );
    return false;
  }

  return true;
}

function testBooleanLiteral(t: Test, exp: Expression, value: Boolean): boolean {
  let valString = value ? 'TRUE' : 'FALSE';
  let bo = exp;
  let ok;

  if (!(bo instanceof AstBoolean)) {
    t.Errorf('exp is not AstBoolean. got=%s', exp);
    return false;
  }
  let boValueString = bo.Value ? 'TRUE' : 'FALSE';
  ok = boValueString === valString;
  if (!ok) {
    t.Assert(ok, 'bo.Value is not %s. got=%s', value, bo.Value);
    return false;
  }

  ok = bo.TokenLiteral() === '' + valString;
  if (!ok) {
    t.Assert(ok, 'bo.TokenLiteral is not %s. got=%s', value, bo.TokenLiteral());
    return false;
  }

  return true;
}

function testINTStatement(t: Test, stmt: Statement, name: string): boolean {
  t.Assert(
    stmt.TokenLiteral() === 'INT',
    `s.TokenLiteral not 'INT'. got=${stmt.TokenLiteral()}`
  );

  if (!(stmt instanceof INTStatement)) {
    t.Errorf(`s not got=LetStatement. got=${typeof stmt}`);
    return false;
  }

  // t.Assert(
  //   stmt.Name.Value === name,
  //   `stmt.Name.Value not ${name}. got=${stmt.Name.Value}`
  // );
  // t.Assert(
  //   stmt.Name.TokenLiteral() === name,
  //   `stmt.Name.TokenLiteral() not ${name}. got=${stmt.Name.TokenLiteral()}`
  // );
  return true;
}

function TestIntegerExpression(t: Test) {
  let input = '5';

  let l = new Lexer(input);
  let p = new Parser(l);
  let program = p.ParseProgram();
  checkParserErrors(t, p);

  t.Assert(
    program.Statements.length === 1,
    'program.Statements does not contain 1 statements. got=%d',
    program.Statements.length
  );
  let stmt = program.Statements[0];
  if (!(stmt instanceof ExpressionStatement)) {
    t.Errorf('program.Statements[0] not type ExpressionStatement. got=%s', typeof stmt);
    return;
  }

  let literal = stmt.Expression;
  if (!(literal instanceof IntegerLiteral)) {
    t.Errorf('exp not type IntegerLiteral. got=%s', typeof literal);
    return;
  }

  t.Assert(literal.Value === 5, 'literal.Value is not 5. got=%s', literal.Value);
  t.Assert(literal.TokenLiteral() === '5', 'literal.TokenLiteral is not "5". got=%s', literal.TokenLiteral());
}

function testInfixExpression(t: Test, exp: Expression, left: any, operator: string, right: any): boolean {
  let opExp = exp;

  if (!(opExp instanceof InfixExpression)) {
    t.Errorf('exp not InfixExpression. got=%s(%s)', opExp.constructor.name, opExp);
    return false;
  }

  if (!testLiteralExpression(t, opExp.Left, left)) {
    return false;
  }

  if (opExp.Operator !== operator) {
    t.Errorf('opExp.Operator is not %s. got=%s', operator, opExp.Operator);
    return false;
  }

  if (!opExp.Right) {
    t.Errorf('opExp.Right is missing, not %s', right);
    return false;
  }

  if (!testLiteralExpression(t, opExp.Right, right)) {
    return false;
  }

  return true;
}

