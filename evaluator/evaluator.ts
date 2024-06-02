import Environment, { NewEnclosedEnvironment } from '../object/environment';
import OObject, {
  NullableOObject,
  OBoolean,
  OError,
  ONull,
  ReturnValue,
  RETURN_VALUE_OBJ,
  ERROR_OBJ,
  INTEGER_OBJ,
  FLOAT_OBJ,
  AnyObject,
  OFloat,
  OInteger,
  OString,
  OComment,
  OFunction,
  Builtin,
  OHash,
  HashPair,
  ONewLine,
  OCharacter,
} from '../object/object';
import {
  AnyNodeType,
  AssignmentStatement,
  AstBoolean,
  ASTProgram,
  BlockStatement,
  CallExpression,
  CharLiteral,
  Comment,
  DecrementExpression,
  DisplayStatement,
  EscapeLiteral,
  Expression,
  ExpressionStatement,
  FloatLiteral,
  FunctionLiteral,
  Identifier,
  IfExpression,
  IncrementExpression,
  InfixExpression,
  IntegerLiteral,
  INTStatement,
  NewLine,
  PrefixExpression,
  ReturnStatement,
  ScanStatement,
  StringLiteral,
  WhileLiteral,
} from '../ast/ast';
import builtins from './builtin';

import readlineSync from 'readline-sync';

export const NULL = new ONull(),
  TRUE = new OBoolean(true),
  FALSE = new OBoolean(false);

export default function Eval(
  node: AnyNodeType | null,
  env: Environment
): NullableOObject {
  if (node instanceof ASTProgram) {
    return evalProgram(node, env);
  } else if (node instanceof ExpressionStatement) {
    return Eval(node.Expression, env);
  } else if (node instanceof FloatLiteral) {
    return new OFloat(node.Value);
  } else if (node instanceof IntegerLiteral) {
    return new OInteger(node.Value);
  } else if (node instanceof StringLiteral) {
    return new OString(node.Value);
  } else if (node instanceof CharLiteral) {
    return new OCharacter(node.Value);
  } else if (node instanceof EscapeLiteral) {
    return new OCharacter(node.Value);
  } else if (node instanceof Comment) {
    return new OComment(node.Value);
  } else if (node instanceof NewLine) {
    return new ONewLine(node.Value);
  } else if (node instanceof AstBoolean) {
    return nativeBoolToBooleanObject(node.Value);
  } else if (node instanceof PrefixExpression) {
    let right = Eval(node.Right, env);
    if (isError(right)) return right;
    return evalPrefixExpression(node.Operator, right);
  } else if (node instanceof InfixExpression) {
    let left = Eval(node.Left, env);
    if (isError(left)) return left;
    let right = Eval(node.Right, env);
    if (isError(right)) return right;
    return evalInfixExpression(node.Operator, left, right);
  } else if (node instanceof BlockStatement) {
    return evalBlockStatement(node, env);
  } else if (node instanceof AssignmentStatement) {
    const value = Eval(node.Value, env);
    if (isError(value)) return value;
    env.Set(node.Name.Value, value);
    return value;
  } else if (node instanceof DisplayStatement) {
    return evalDisplayStatement(node, env);
  } else if (node instanceof ScanStatement) {
    return evalScanStatement(node, env);
  } else if (node instanceof IfExpression) {
    return evalIfExpression(node, env);
  } else if (node instanceof ReturnStatement) {
    let val = Eval(node.ReturnValue, env);
    if (isError(val)) return val;
    return val ? new ReturnValue(val) : null;
  } else if (node instanceof INTStatement) {
    for (let identifier of node.Identifiers) {
      let value = null;
      if (identifier.initialValue) {
        value = Eval(identifier.initialValue, env);
        if (isError(value)) return value;
      }
      env.Set(identifier.identifier.Value, value);
    }
    return NULL;
  } else if (node instanceof Identifier) {
    return evalIdentifier(node, env);
  } else if (node instanceof WhileLiteral) {
    return evalWhile(node.Expression, node.Body, env);
  } else if (node instanceof FunctionLiteral) {
    return new OFunction(node.Parameters, node.Body, env);
  } else if (node instanceof CallExpression) {
    let func = Eval(node.Function, env);
    if (isNotError(func)) {
      let args = evalExpressions(node.Arguments, env);
      if (args.length === 1 && isError(args[0])) {
        return args[0];
      }
      return applyFunction(env, func, args);
    }
    return func;
  } else if (node instanceof IncrementExpression) {
    return evalIncrementIdentifier(node, env);
  } else if (node instanceof DecrementExpression) {
    return evalDecrementIdentifier(node, env);
  }

  return null;
}

function evalProgram(program: ASTProgram, env: Environment): NullableOObject {
  let result: NullableOObject = null;

  for (let statement of program.Statements) {
    result = Eval(statement, env);

    if (result instanceof ReturnValue) {
      return result.Value;
    } else if (result instanceof OError) {
      return result;
    }
  }

  return result;
}

function evalBlockStatement(
  program: BlockStatement,
  env: Environment
): NullableOObject {
  let result: NullableOObject = null;

  for (let statement of program.Statements) {
    result = Eval(statement, env);
    if (result !== null) {
      let rt = result.Type();
      if (rt === RETURN_VALUE_OBJ || rt === ERROR_OBJ) {
        return result;
      }
    }
  }

  return result;
}

function evalPrefixExpression(
  operator: string,
  right: NullableOObject
): OObject {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right);
    case '-':
      return evalMinusPrefixOperatorExpression(right);
    case '~':
      return evalNotPrefixOperatorExpression(right);
    default:
      if (operator === 'NOT') {
        return evalBangOperatorExpression(right);
      }
      return newError(
        'unknown operator: %s%s',
        operator,
        right ? right.Type() : null
      );
  }
}

function evalBangOperatorExpression(right: AnyObject | null): OObject {
  if (!right) return FALSE;

  if (right instanceof ONull) {
    return TRUE;
  } else if (right instanceof OBoolean && right.Value === true) {
    return FALSE;
  } else if (right instanceof OBoolean && right.Value === false) {
    return TRUE;
  }

  return FALSE;
}

function evalMinusPrefixOperatorExpression(right: AnyObject | null): OObject {
  if (!right) return FALSE;

  if (right.Type() !== INTEGER_OBJ && right.Type() !== FLOAT_OBJ) {
    return newError('unknown operator: -%s', right.Type());
  } else if (!(right instanceof OInteger) && !(right instanceof OFloat)) {
    return NULL;
  }

  let value = right.Value;
  if (right instanceof OFloat) return new OFloat(-value);
  return new OInteger(-value);
}

function evalNotPrefixOperatorExpression(right: AnyObject | null): OObject {
  if (!right) return FALSE;

  if (right.Type() !== INTEGER_OBJ) {
    return newError('unknown operator: -%s', right.Type());
  } else if (!(right instanceof OInteger)) {
    return NULL;
  }

  let value = right.Value;
  return new OInteger(~value);
}

function evalInfixExpression(
  operator: string,
  left: NullableOObject,
  right: NullableOObject
): OObject {
  if (left instanceof OInteger && right instanceof OInteger) {
    return evalIntegerInfixExpression(operator, left, right);
  } else if (left instanceof OFloat && right instanceof OFloat) {
    return evalFloatInfixExpression(operator, left, right);
  } else if (left instanceof OInteger && right instanceof OFloat) {
    return evalFloatInfixExpression(operator, left, right);
  } else if (left instanceof OFloat && right instanceof OInteger) {
    return evalFloatInfixExpression(operator, left, right);
  } else if (left instanceof OString && right instanceof OString) {
    return evalStringInfixExpression(operator, left, right);
  } else if (operator === '==') {
    return nativeBoolToBooleanObject(left === right);
  } else if (operator === '<>') {
    return nativeBoolToBooleanObject(left !== right);
  } else if (operator === 'AND' || operator === '&&') {
    // if left AND right are TRUE
    if (!left || !(left instanceof OBoolean))
      return nativeBoolToBooleanObject(false);
    if (!right || !(right instanceof OBoolean))
      return nativeBoolToBooleanObject(false);
    return nativeBoolToBooleanObject(left.Value && right.Value);
  } else if (operator === 'OR' || operator === '||') {
    // if left OR right are TRUE
    if (left && left instanceof OBoolean && left.Value)
      return nativeBoolToBooleanObject(true);
    if (right && right instanceof OBoolean && right.Value)
      return nativeBoolToBooleanObject(true);
    return nativeBoolToBooleanObject(false);
  } else if (left !== null && right !== null && left.Type() !== right.Type()) {
    return newError(
      'type mismatch: %s %s %s',
      left.Type(),
      operator,
      right.Type()
    );
  } else {
    return newError(
      'unknown operator: %s %s %s',
      left ? left.Type() : null,
      operator,
      right ? right.Type() : null
    );
  }
}

function evalIntegerInfixExpression(
  operator: string,
  left: OInteger,
  right: OInteger
): OObject {
  let leftVal = left.Value;
  let rightVal = right.Value;

  switch (operator) {
    case '+':
      return new OInteger(leftVal + rightVal);
    case '-':
      return new OInteger(leftVal - rightVal);
    case '*':
      return new OInteger(leftVal * rightVal);
    case '/':
      return new OInteger(leftVal / rightVal);
    case '%':
      return new OInteger(leftVal % rightVal);
    case '<':
      return nativeBoolToBooleanObject(leftVal < rightVal);
    case '>':
      return nativeBoolToBooleanObject(leftVal > rightVal);
    case '<=':
      return nativeBoolToBooleanObject(leftVal <= rightVal);
    case '>=':
      return nativeBoolToBooleanObject(leftVal >= rightVal);
    case '==':
      return nativeBoolToBooleanObject(leftVal === rightVal);
    case '<>':
      return nativeBoolToBooleanObject(leftVal !== rightVal);
    default:
      return newError(
        'unknown operator: %s %s %s',
        left.Type(),
        operator,
        right.Type()
      );
  }
}

function evalFloatInfixExpression(
  operator: string,
  left: OFloat | OInteger,
  right: OFloat | OInteger
): OObject {
  let leftVal = left.Value;
  let rightVal = right.Value;

  switch (operator) {
    case '+':
      return new OFloat(leftVal + rightVal);
    case '-':
      return new OFloat(leftVal - rightVal);
    case '*':
      return new OFloat(leftVal * rightVal);
    case '/':
      return new OFloat(leftVal / rightVal);
    case '%':
      return new OFloat(leftVal % rightVal);
    case '<':
      return nativeBoolToBooleanObject(leftVal < rightVal);
    case '>':
      return nativeBoolToBooleanObject(leftVal > rightVal);
    case '<=':
      return nativeBoolToBooleanObject(leftVal <= rightVal);
    case '>=':
      return nativeBoolToBooleanObject(leftVal >= rightVal);
    case '==':
      return nativeBoolToBooleanObject(leftVal === rightVal);
    case '<>':
      return nativeBoolToBooleanObject(leftVal !== rightVal);
    default:
      return newError(
        'unknown operator: %s %s %s',
        left.Type(),
        operator,
        right.Type()
      );
  }
}

function evalStringInfixExpression(
  operator: string,
  left: OString,
  right: OString
): OObject {
  if (operator === '+') {
    let leftVal = left.Value;
    let rightVal = right.Value;
    return new OString(leftVal + rightVal);
  } else if (operator === '==') {
    let leftVal = left.Value;
    let rightVal = right.Value;
    return new OBoolean(leftVal === rightVal);
  } else if (operator === '<') {
    let leftVal = left.Value;
    let rightVal = right.Value;
    return new OBoolean(leftVal < rightVal);
  } else if (operator === '>') {
    let leftVal = left.Value;
    let rightVal = right.Value;
    return new OBoolean(leftVal > rightVal);
  }

  return newError(
    'unknown operator: %s %s %s',
    left.Type(),
    operator,
    right.Type()
  );
}

function evalIfExpression(ie: IfExpression, env: Environment): NullableOObject {
  let condition = Eval(ie.Condition, env);

  if (isError(condition)) {
    console.log('error');
    return condition;
  }
  if (isTruthy(condition)) {
    // console.log('ari');
    return Eval(ie.Consequence, env);
  } else if (ie.Alternative !== null) {
    // console.log('diri');
    return Eval(ie.Alternative, env);
  } else {
    // console.log('amaw')
    return NULL;
  }
}

/*
let a = {'b': 1};
let a['c'] = 2;
a['c']
let a['hi'] = function(x){print("Hello " + x + "!")}
a['hi']("World")
*/
// function evalINTStatement(
//   stmt: INTStatement,
//   env: Environment
// ): NullableOObject {
//   if (!stmt.Index) return NULL;

//   // Eval the parts of the statement
//   // let (a)['c'] = 2; // ident name
//   let name = stmt.Name;
//   // let (a)['c'] = 2; // ident value
//   let hash = evalIdentifier(stmt.Name, env) as OHash;
//   // let a[('c')] = 2; // hash index
//   let key = Eval(stmt.Index.Index, env) as OString;
//   if (!key) return NULL;
//   // let a['c'] = (2); // new value
//   let val = Eval(stmt.Value, env);

//   // Set the new value
//   let pair = new HashPair(key, val ? val : NULL);
//   hash.Pairs.set(key.HashKey().Match, pair);

//   // Overwrite the env's hash
//   env.Set(name.Value, hash);

//   return val;
// }
function evalINTStatement(
  stmt: INTStatement,
  env: Environment
): NullableOObject {
  if (!stmt.Index) return NULL;
  let result: NullableOObject = NULL;

  for (let identifier of stmt.Identifiers) {
    let value = null;
    if (identifier.initialValue) {
      value = Eval(identifier.initialValue, env);
      if (isError(value)) return value;
    }
    env.Set(identifier.identifier.Value, value);
  }

  return result;
}

function evalIdentifier(node: Identifier, env: Environment): NullableOObject {
  let val = env.Get(node.Value);
  try {
    if (!val) throw new Error('Identifier not found');
  } catch(err) {
    if (err instanceof Error) {
      console.log(err.message);
    } else {
      console.log('An unknown error occurred');
    }
  }
  if (val) {
    return val;
  }

  if (builtins[node.Value]) {
    return builtins[node.Value];
  }

  return newError(
    'identifier not found: %s at %s',
    node.Value,
    node.Token.Position.String()
  );
}

// INT a = 0; WHILE(a<=500000){ INT a = a + 1; } a;
// while(true){}
function evalWhile(
  expression: Expression,
  body: BlockStatement | null,
  env: Environment
): NullableOObject {
  let result: NullableOObject = null;

  let loopCount = 0;
  while (true) {
    result = Eval(expression, env);

    if (++loopCount > 1000000) {
      // prevent infinite loop
      return newError('loop count of 1,000,000 exeeded');
    } else if (result instanceof ONull) {
      break;
    } else if (result instanceof OBoolean && result.Value === true) {
      Eval(body, env);
    } else if (result instanceof OBoolean && result.Value === false) {
      break;
    } else {
      break;
    }
  }

  return result;
}

function evalExpressions(exps: Expression[], env: Environment): OObject[] {
  let result: OObject[] = [];

  for (let e of exps) {
    let evaluated = Eval(e, env);
    if (isNotError(evaluated)) {
      result.push(evaluated);
      continue;
    }
    if (isError(evaluated)) {
      return [evaluated];
    }
  }

  return result;
}

function nativeBoolToBooleanObject(input: boolean): OBoolean {
  if (input) {
    return TRUE;
  }
  return FALSE;
}

export function applyFunction(
  env: Environment,
  fn: OObject,
  args: OObject[]
): NullableOObject {
  let func = fn;
  if (func instanceof OFunction) {
    let extendedEnv = extendedFunctionEnv(func, args);
    let evaluated = Eval(func.Body, extendedEnv);
    return unwrapReturnValue(evaluated);
  } else if (func instanceof Builtin) {
    return func.Fn(env, ...args);
  }

  return newError('not a function: %s', fn.Type());
}

function extendedFunctionEnv(fn: OFunction, args: OObject[]): Environment {
  let env = NewEnclosedEnvironment(fn.Env);

  for (let [paramIdx, param] of fn.Parameters.entries()) {
    env.Set(param.Value, args[paramIdx]);
  }

  return env;
}

function unwrapReturnValue(obj: NullableOObject): NullableOObject {
  let returnValue = obj;
  if (returnValue instanceof ReturnValue) {
    return returnValue.Value;
  }

  return obj;
}

function isTruthy(obj: NullableOObject): boolean {
  switch (obj) {
    case NULL:
      return false;
    case TRUE:
      return true;
    case FALSE:
      return false;
    default:
      return true;
  }
}

export function newError(format: string, ...args: any[]): OError {
  return new OError(printf(format, ...args));
}

function printf(...args: any[]): string {
  return [...args].reduce((p, c) => p.replace(/%s/, c));
}

function isError(obj: NullableOObject): obj is OObject {
  if (obj !== null) {
    return obj.Type() === ERROR_OBJ;
  }
  return false;
}

function isNotError(obj: NullableOObject): obj is OObject {
  if (obj !== null) {
    return obj.Type() !== ERROR_OBJ;
  }
  return true;
}

function evalDisplayStatement(
  args: DisplayStatement,
  env: Environment
): NullableOObject {
  let result: NullableOObject = NULL;

  let output = '';

  for (let arg of args.Args) {
    let evaluated = Eval(arg, env);
    if (evaluated instanceof OFloat) {
      output += evaluated.Value.toFixed(1);
    } else if (isError(evaluated)) {
      return evaluated;
    } else {
      output += evaluated!.Inspect();
    }
  }

  console.log(output);

  return result;
}

function evalScanStatement(
  args: ScanStatement,
  env: Environment
): NullableOObject {
  let result: NullableOObject = NULL;
  const input = readlineSync.prompt();
  const inputValues = input.split(',').map((value) => value.trim());

  if (inputValues.length < args.Names.length) {
    console.error('Not enough input values provided.');
    return result;
  }

  args.Names.forEach((name, index) => {
    const input = inputValues[index];
    const variable = env.Get(name.Value);
    let parsedInput;

    if (variable instanceof OBoolean) {
      parsedInput = nativeBoolToBooleanObject(input.toUpperCase() === 'TRUE');
    } else if (variable instanceof OInteger) {
      parsedInput = new OInteger(parseInt(input));
    } else if (variable instanceof OFloat) {
      parsedInput = new OFloat(parseFloat(input));
    } else if (variable instanceof OString) {
      parsedInput = new OString(input);
    } else if (variable instanceof OCharacter) {
      parsedInput = new OCharacter(input[0]);
    } else {
      console.error(`Unsupported type for variable '${name.Value}'.`);
      return;
    }

    env.Set(name.Value, parsedInput);
  });

  return result;
}

function evalIncrementIdentifier(
  node: IncrementExpression,
  env: Environment
): NullableOObject {
  let val = env.Get(node.Name.Value);
  if (val) {
    let incremented: OInteger | OFloat = new OInteger(0);
    if (val instanceof OInteger) {
      incremented = new OInteger(val.toValue() + 1);
    } else if (val instanceof OFloat) {
      incremented = new OFloat(val.toValue() + 1);
    }
    env.Set(node.Name.Value, incremented);
    return node.Prefix ? incremented : val;
  }

  return newError(
    'identifier not found: %s at %s',
    node.Name.Value,
    node.Token.Position.String()
  );
}

function evalDecrementIdentifier(
  node: DecrementExpression,
  env: Environment
): NullableOObject {
  let val = env.Get(node.Name.Value);
  if (val) {
    let decremented = new OInteger(val.toValue() - 1);
    env.Set(node.Name.Value, decremented);
    return node.Prefix ? decremented : val;
  }

  return newError(
    'identifier not found: %s at %s',
    node.Name.Value,
    node.Token.Position.String()
  );
}
