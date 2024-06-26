import Test from '../test';
import OObject, {
  OInteger,
  OFloat,
  OBoolean,
  OError,
  NullableOObject,
  OFunction,
  OString,
  OHash,
  HashKey,
} from '../object/object';
import Lexer from '../lexer/lexer';
import Parser from '../parser/parser';
import Eval, { TRUE, FALSE, NULL } from './evaluator';
import { NewEnvironment } from '../object/environment';

export function TestEval(t: Test) {
  console.log('║  ├ TestEvalIntegerExpression');
  TestEvalIntegerExpression(t);
  console.log('║  ├ TestEvalFloatExpression');
  TestEvalFloatExpression(t);
  console.log('║  ├ TestEvalBooleanExpression');
  TestEvalBooleanExpression(t);
  console.log('║  ├ TestBangOperator');
  TestBangOperator(t);
  console.log('║  ├ TestIfElseExpressions');
  TestIfElseExpressions(t);
  console.log('║  ├ TestReturnStatements');
  TestReturnStatements(t);
  console.log('║  ├ TestErrorHandling');
  TestErrorHandling(t);
  console.log('║  ├ TestLetStatements');
  TestINTStatements(t);
  console.log('║  ├ TestFunctionObject');
  TestFunctionObject(t);
  // console.log('║  ├ TestFunctionApplication');
  // TestFunctionApplication(t);
  console.log('║  ├ TestClosures');
  TestClosures(t);
  console.log('║  ├ TestStringLiteral');
  TestStringLiteral(t);
  console.log('║  ├ TestStringConcatination');
  TestStringConcatination(t);
  console.log('║  ├ TestBuiltinFunctions');
  TestBuiltinFunctions(t);
}

export function TestEvalIntegerExpression(t: Test) {
  let tests = [
    { input: '5', expected: 5 },
    { input: '10', expected: 10 },
    { input: '-5', expected: -5 },
    { input: '-10', expected: -10 },
    { input: '5 + 5 + 5 + 5 10', expected: 10 },
    { input: '2 * 2 * 2 * 2 * 2', expected: 32 },
    { input: '-50 + 100 + -50', expected: 0 },
    { input: '5 * 2 + 10', expected: 20 },
    { input: '5 + 2 * 10', expected: 25 },
    { input: '10 % 5', expected: 0 },
    { input: '3 % 2', expected: 1 },
    { input: '5 % 3', expected: 2 },
    { input: '20 + 2 * -10', expected: 0 },
    { input: '50 / 2 * 2 + 10', expected: 60 },
    { input: '2 * (5 + 10)', expected: 30 },
    { input: '3 * 3 * 3 + 10', expected: 37 },
    { input: '3 * (3 * 3) + 10', expected: 37 },
    { input: '(5 + 10 * 2 + 15 / 3) * 2 + -10', expected: 50 },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    testIntegerObject(t, evaluated, tt.expected);
  }
}

export function TestEvalFloatExpression(t: Test) {
  let tests = [
    { input: '5.1', expected: 5.1 },
    { input: '10.1', expected: 10.1 },
    { input: '-5.1', expected: -5.1 },
    { input: '-10.1', expected: -10.1 },
    { input: '123.45', expected: 123.45 },
    { input: '66.6 / 3', expected: 22.2 },
    { input: '10.5 % 0.5', expected: 0 },
    // { input: '.010', expected: 0.01 },
    { input: '5.00000000', expected: 5 },
    { input: '0.000001 + 1', expected: 1.000001 },
    { input: '0.000001 - 1', expected: -0.999999 },
    { input: '(5 + 10 * 2 + 15 / 3) * 2 + -10.0', expected: 50 },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    testFloatObject(t, evaluated, tt.expected);
  }
}

export function TestEvalBooleanExpression(t: Test) {
  let tests = [
    { input: 'TRUE', expected: true },
    { input: 'FALSE', expected: false },
    { input: '1 < 2', expected: true },
    { input: '1 > 2', expected: false },
    { input: '1 < 1', expected: false },
    { input: '1 > 1', expected: false },
    { input: '1 <= 1', expected: true },
    { input: '1 >= 1', expected: true },
    { input: '2 <= 1', expected: false },
    { input: '1 >= 2', expected: false },
    { input: '1 == 1', expected: true },
    { input: '1 <> 1', expected: false },
    { input: '1 == 2', expected: false },
    { input: '1 <> 2', expected: true },
    { input: 'TRUE == TRUE', expected: true },
    { input: 'FALSE == FALSE', expected: true },
    { input: 'TRUE == FALSE', expected: false },
    { input: 'TRUE <> FALSE', expected: true },
    { input: 'FALSE <> TRUE', expected: true },
    { input: '(1 < 2) == TRUE', expected: true },
    { input: '(1 < 2) == FALSE', expected: false },
    { input: '(1 > 2) == TRUE', expected: false },
    { input: '(1 > 2) == FALSE', expected: true },
    { input: '1 > 0.5', expected: true },
    { input: '55 <= 55.5', expected: true },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    testBooleanObject(t, evaluated, tt.expected);
  }
}

export function TestBangOperator(t: Test) {
  let tests = [
    { input: '!TRUE', expected: false },
    { input: '!FALSE', expected: true },
    { input: '!5', expected: false },
    { input: '!!TRUE', expected: true },
    { input: '!!FALSE', expected: false },
    { input: '!!5', expected: true },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    testBooleanObject(t, evaluated, tt.expected);
  }
}

export function TestIfElseExpressions(t: Test) {
  let tests = [
    { input: 'IF (TRUE) BEGIN IF 10 END IF', expected: 10 },
    { input: 'IF (FALSE) BEGIN IF 10 END IF', expected: null },
    { input: 'IF (FALSE OR TRUE) BEGIN IF 10 END IF', expected: 10 },
    { input: 'IF (FALSE AND TRUE) BEGIN IF 10 END IF ELSE BEGIN IF 20 END IF', expected: 20 },
    { input: 'IF (1) BEGIN IF 10 END IF', expected: 10 },
    { input: 'IF (1 < 2) BEGIN IF 10 END IF', expected: 10 },
    { input: 'IF (1 > 2) BEGIN IF 10 END IF', expected: null },
    { input: 'IF (1 > 2) BEGIN IF 10 END IF ELSE BEGIN IF 20 END IF', expected: 20 },
    { input: 'IF (1 < 2) BEGIN IF 10 END IF ELSE BEGIN IF 20 END IF', expected: 10 },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    if (typeof tt.expected === 'number') {
      testIntegerObject(t, evaluated, tt.expected);
    } else {
      testNullObject(t, evaluated);
    }
  }
}

export function TestReturnStatements(t: Test) {
  let tests = [
    {
      input: `
IF (10 > 1) {
  IF (10 > 1) {
    RETURN 10;
  }

  RETURN 1;
}
    `,
      expected: 10,
    },
    { input: 'RETURN 10;', expected: 10 },
    { input: 'RETURN 10; 9', expected: 10 },
    { input: 'RETURN 2 * 5; 9', expected: 10 },
    { input: '9; RETURN 2 * 5; 9', expected: 10 },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    testIntegerObject(t, evaluated, tt.expected);
  }
}

export function TestErrorHandling(t: Test) {
  let tests = [
    { input: '5 + TRUE;', expected: 'type mismatch: INTEGER + BOOLEAN' },
    { input: '5 + TRUE; 5;', expected: 'type mismatch: INTEGER + BOOLEAN' },
    { input: '-TRUE', expected: 'unknown operator: -BOOLEAN' },
    { input: 'TRUE + FALSE;', expected: 'unknown operator: BOOLEAN + BOOLEAN' },
    { input: 'TRUE + FALSE + TRUE + FALSE;', expected: 'unknown operator: BOOLEAN + BOOLEAN' },
    { input: '5; TRUE + FALSE; 5', expected: 'unknown operator: BOOLEAN + BOOLEAN' },
    { input: 'IF (10 > 1) { TRUE + FALSE; }', expected: 'unknown operator: BOOLEAN + BOOLEAN' },
    {
      input: `
IF (10 > 1) {
  IF (10 > 1) {
    RETURN TRUE + FALSE;
  }

  RETURN 1;
}
`,
      expected: 'unknown operator: BOOLEAN + BOOLEAN',
    },
    { input: 'foobar', expected: 'identifier not found: foobar at line 1, column 1' },
    { input: '"Hello" - "World"', expected: 'unknown operator: STRING - STRING' },
    // {
    //   input: `{"name": "Monkey"}[function(x) { x }];`,
    //   expected: 'unusable as hash key: FUNCTION',
    // },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. from=%s; got=%s', tt.input, evaluated);
      continue;
    }

    let errObj = evaluated;
    if (!(errObj instanceof OError)) {
      t.Errorf('no error object returned. got=%s', errObj.constructor.name);
      continue;
    }

    if (errObj.Message !== tt.expected) {
      t.Errorf('wrong error message. expected=%s, got=%s', tt.expected, errObj.Message);
    }
  }
}

export function TestINTStatements(t: Test) {
  let tests = [
    { input: 'INT a = 5', expected: 5 },
    { input: 'INT a = 5 * 5; a;', expected: 25 },
    { input: 'INT a = 5; INT b = a; b;', expected: 5 },
    { input: 'INT a = 5; INT b = a; INT c = a + b + 5; c;', expected: 15 },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    testIntegerObject(t, evaluated, tt.expected);
  }
}

function TestFunctionObject(t: Test) {
  let input = 'FUNCTION(x) { x + 2; };';

  let evaluated = testEval(input);
  if (!evaluated) {
    t.Errorf('input not evaluated. got=%s', evaluated);
    return;
  }

  let fn = evaluated;
  if (!(fn instanceof OFunction)) {
    t.Errorf('object is not OFunction. got=%s', fn.constructor.name);
    return;
  }

  if (fn.Parameters.length !== 1) {
    t.Fatalf('function has wrong parameters. Parameters=%s', fn.Parameters);
  }

  let expectedBody = '(x + 2)';

  if (fn.Body.String() !== expectedBody) {
    t.Fatalf('body is not %s. got=%s', expectedBody, fn.Body.String());
  }
}

function TestFunctionApplication(t: Test) {
  let tests = [
    { input: 'INT identity = FUNCTION(x) { x; }; identity(5);', expected: 5 },
    { input: 'INT identity = FUNCTION(x) { RETURN x; }; identity(5);', expected: 5 },
    { input: 'INT double = FUNCTION(x) { x * 2; }; double(5);', expected: 10 },
    { input: 'INT add = FUNCTION(x, y) { x + y; }; add(5, 5);', expected: 10 },
    { input: 'INT add = FUNCTION(x, y) { x + y; }; add(5 + 5, add(5, 5));', expected: 20 },
    { input: 'FUNCTION(x) { x; }(5)', expected: 5 },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    testIntegerObject(t, evaluated, tt.expected);
  }
}

function TestClosures(t: Test) {
  let input = `
INT newAdder = FUNCTION(x){
  FUNCTION(y) { x + y };
};

INT addTwo = newAdder(2);
addTwo(3);
`;

  let evaluated = testEval(input);
  if (!evaluated) {
    t.Errorf('input not evaluated. got=%s', evaluated);
    return;
  }

  testIntegerObject(t, evaluated, 5);
}

function TestStringLiteral(t: Test) {
  let input = '"Hello World!"';

  let evaluated = testEval(input);
  if (!evaluated) {
    t.Errorf('input not evaluated. got=%s', evaluated);
    return;
  }

  let str = evaluated;
  if (!(str instanceof OString)) {
    t.Errorf('object is not OString. got=%s', str.constructor.name);
    return;
  }

  if (str.Value !== 'Hello World!') {
    t.Errorf('String has wrong value. got=%s', str.Value);
  }
}

function TestStringConcatination(t: Test) {
  let input = '"Hello" + " " + "World!"';

  let evaluated = testEval(input);
  if (!evaluated) {
    t.Errorf('input not evaluated. got=%s', evaluated);
    return;
  }

  let str = evaluated;
  if (!(str instanceof OString)) {
    t.Errorf('object is not OString. got=%s, %s', str.constructor.name, str.Inspect());
    return;
  }

  if (str.Value !== 'Hello World!') {
    t.Errorf('String has wrong value. got=%s', str.Value);
  }
}

function TestBuiltinFunctions(t: Test) {
  let tests = [
    { input: 'len("")', expected: 0 },
    { input: 'len("four")', expected: 4 },
    { input: 'len("hello world")', expected: 11 },
    { input: 'len(1)', expected: 'argument to `len` not supported, got INTEGER' },
    { input: 'len("one", "two")', expected: 'wrong number of arguments. got=2, want=1' },
  ];

  for (let tt of tests) {
    let evaluated = testEval(tt.input);
    if (!evaluated) {
      t.Errorf('input not evaluated. got=%s', evaluated);
      continue;
    }

    if (typeof tt.expected === 'number') {
      testIntegerObject(t, evaluated, tt.expected);
    } else if (typeof tt.expected === 'string') {
      let errObj = evaluated;
      if (!(errObj instanceof OError)) {
        t.Errorf('object is not OError. got=%s, %s', typeof errObj, errObj);
        continue;
      }

      if (errObj.Message !== tt.expected) {
        t.Errorf('wrong error message. expected=%s, got=%s', tt.expected, errObj.Message);
      }
    }
  }
}

function testEval(input: string): NullableOObject {
  let l = new Lexer(input);
  let p = new Parser(l);
  let env = NewEnvironment();
  let program = p.ParseProgram();

  return Eval(program, env);
}

function testIntegerObject(t: Test, obj: OObject, expected: number): boolean {
  let result = obj;

  if (!(result instanceof OInteger)) {
    t.Errorf('object is not OInteger. got=%s(%s)', result.constructor.name, Object.values(result));
    return false;
  }

  if (result.Value !== expected) {
    t.Errorf('object has wrong value. got=%s, want=%d', result.Value, expected);
    return false;
  }

  return true;
}

function testFloatObject(t: Test, obj: OObject, expected: number): boolean {
  let result = obj;

  if (!(result instanceof OFloat)) {
    t.Errorf('object is not OFloat. got=%s(%s)', result.constructor.name, Object.values(result));
    return false;
  }

  if (result.Value !== expected) {
    t.Errorf('object has wrong value. got=%s, want=%d', result.Value, expected);
    return false;
  }

  return true;
}

function testBooleanObject(t: Test, obj: OObject, expected: boolean): boolean {
  let result = obj;

  if (!(result instanceof OBoolean)) {
    t.Errorf('object is not OBoolean. got=%s(%s)', result.constructor.name, Object.values(result));
    return false;
  }

  if (result.Value !== expected) {
    t.Errorf('object has wrong value. got=%s, want=%s', result.Value, expected);
    return false;
  }

  return true;
}

function testNullObject(t: Test, obj: OObject): boolean {
  if (obj !== NULL) {
    t.Errorf('object is not NULL. got=%s (%s)', obj.constructor.name, obj);
    return false;
  }

  return true;
}
