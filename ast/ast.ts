import Token from '../token/token';

export type AnyNodeType = Node | Statement | Expression | ASTProgram;

export interface Node {
  TokenLiteral(): string;
  String(): string;
}

export type VariableDeclaration = {
  identifier: Identifier;
  initialValue?: Expression;
}

export interface Statement extends Node {}
export interface Expression extends Node {}

export class ASTProgram implements Node {
  Statements: Statement[] = [];

  constructor(statements = []) {
    this.Statements = statements;
  }

  TokenLiteral() {
    if (this.Statements.length > 0) {
      return this.Statements[0].TokenLiteral();
    } else {
      return '';
    }
  }

  String() {
    return this.Statements.map((stmt) => stmt.String()).join('');
  }
}

export class Identifier implements Expression {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Value;
  }
}

// export class INTStatement implements Statement {
//   Token: Token;
//   Name: Identifier;
//   Value: Expression | Identifier | null;
//   Index: IndexExpression | null;

//   constructor(
//     token: Token,
//     name: Identifier,
//     value: Expression | Identifier | null,
//     index: IndexExpression | null = null
//   ) {
//     this.Token = token;
//     this.Name = name;
//     this.Value = value;
//     this.Index = index;
//   }

//   TokenLiteral() {
//     return this.Token.Literal;
//   }

//   String() {
//     return `${this.TokenLiteral()} ${this.Name.String()}${
//       this.Index ? this.Index.String() : ''
//     } = ${this.Value!.String()};`;
//   }
// }
export class INTStatement implements Statement {
  Token: Token;
  Identifiers: VariableDeclaration[];
  Index: IndexExpression | null;

  constructor(
    token: Token,
    identifiers: VariableDeclaration[],
    index: IndexExpression | null = null
  ) {
    this.Token = token;
    this.Identifiers = identifiers;
    this.Index = index;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return `${this.TokenLiteral()} ${this.Identifiers
      .map((i) => `${i.identifier.String()} = ${i.initialValue?.String()}`)
      .join(', ')};`;
  }
}

export class ReturnStatement implements Statement {
  Token: Token;
  ReturnValue: Expression | null;

  constructor(token: Token, returnValue = null) {
    this.Token = token;
    this.ReturnValue = returnValue;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    let out = `${this.TokenLiteral()} = `;
    if (this.ReturnValue !== null) out += this.ReturnValue.String();
    out += ';';
    return out;
  }
}

export class BoolStatement implements Statement {
  Token: Token;
  Name: Identifier;
  Value: Expression | Identifier;
  Index: IndexExpression | null;

  constructor(
    token: Token,
    name: Identifier,
    value: Expression | Identifier,
    index: IndexExpression | null = null
  ) {
    this.Token = token;
    this.Name = name;
    this.Value = value;
    this.Index = index;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return `${this.TokenLiteral()} ${this.Name.String()}${
      this.Index ? this.Index.String() : ''
    } = ${this.Value.String()};`;
  }
}

export class CharStatement implements Statement {
  Token: Token;
  Name: Identifier;
  Value: Expression | Identifier;
  Index: IndexExpression | null;

  constructor(
    token: Token,
    name: Identifier,
    value: Expression | Identifier,
    index: IndexExpression | null = null
  ) {
    this.Token = token;
    this.Name = name;
    this.Value = value;
    this.Index = index;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return `${this.TokenLiteral()} ${this.Name.String()}${
      this.Index ? this.Index.String() : ''
    } = ${this.Value.String()};`;
  }
}

export class ExpressionStatement implements Statement {
  Token: Token;
  Expression: Expression;

  constructor(token: Token, expression: Expression) {
    this.Token = token;
    this.Expression = expression;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Expression.String();
  }
}

export class Comment implements Statement {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Value;
  }
}

export class IntegerLiteral implements Expression {
  Token: Token;
  Value: number;

  constructor(token: Token, value: number) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Token.Literal;
  }
}
export class FloatLiteral implements Expression {
  Token: Token;
  Value: number;

  constructor(token: Token, value: number) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Token.Literal;
  }
}

export class CharLiteral implements Expression {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Token.Literal;
  }
}

export class PrefixExpression implements Expression {
  Token: Token;
  Operator: string;
  Right: Expression;

  constructor(token: Token, operator: string, right: Expression) {
    this.Token = token;
    this.Operator = operator;
    this.Right = right;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return `(${this.Operator}${this.Right.String()})`;
  }
}

export class InfixExpression implements Expression {
  Token: Token;
  Left: Expression;
  Operator: string;
  Right: Expression | null = null;

  constructor(
    token: Token,
    left: Expression,
    operator: string,
    right: Expression | null
  ) {
    this.Token = token;
    this.Left = left;
    this.Operator = operator;
    this.Right = right;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return `(${this.Left.String()} ${this.Operator} ${this.Right!.String()})`;
  }
}

export class AstBoolean implements Expression {
  Token: Token;
  Value: boolean;

  constructor(token: Token, value: boolean) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Token.Literal;
  }
}

export class IfExpression implements Expression {
  Token: Token;
  Condition: Expression;
  Consequence: BlockStatement;
  Alternative: BlockStatement | null;

  constructor(
    token: Token,
    condition: Expression,
    consequence: BlockStatement,
    alternative: BlockStatement | null = null
  ) {
    this.Token = token;
    this.Condition = condition;
    this.Consequence = consequence;
    this.Alternative = alternative;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    let out = `${this.Condition.String()} ${this.Consequence.String()}`;
    if (this.Alternative !== null) out += `ELSE ${this.Alternative.String()}`;
    return out;
  }
}

export class BlockStatement implements Statement {
  Token: Token;
  Statements: Statement[] = [];

  constructor(token: Token, statements = []) {
    this.Token = token;
    this.Statements = statements;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Statements.map((stmt) => stmt.String()).join('');
  }
}

export class WhileLiteral implements Statement {
  Token: Token;
  Expression: Expression;
  Body: BlockStatement | null = null;

  constructor(token: Token, expression: Expression, body: BlockStatement | null) {
    this.Token = token;
    this.Expression = expression;
    this.Body = body;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    // return `${this.TokenLiteral()}(${this.Expression.String()}) ${this.Body.String()}`;
    return `${this.TokenLiteral()}(${this.Expression.String()})`;
  }
}

export class FunctionLiteral implements Expression {
  Token: Token;
  Parameters: Identifier[] = [];
  Body: BlockStatement;

  constructor(
    token: Token,
    parameters: Identifier[] = [],
    body: BlockStatement
  ) {
    this.Token = token;
    this.Parameters = parameters;
    this.Body = body;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    let params: string[] = this.Parameters.map((p) => p.String());

    return `${this.TokenLiteral()}(${params.join(', ')}) ${this.Body.String()}`;
  }
}

export class CallExpression implements Expression {
  Token: Token;
  Function: Expression;
  Arguments: Expression[];

  constructor(token: Token, func: Expression, args: Expression[] = []) {
    this.Token = token;
    this.Function = func;
    this.Arguments = args;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    let args: string[] = this.Arguments.map((a) => a.String());

    return `${this.Function.String()}(${args.join(', ')})`;
  }
}

export class StringLiteral implements Expression {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Token.Literal;
  }
}

export class IndexExpression implements Expression {
  Token: Token;
  Left: Expression;
  Index: Expression | null = null;
  HasColon: boolean;
  RightIndex: Expression | null = null;

  constructor(
    token: Token,
    left: Expression,
    index: Expression | null = null,
    hasColon: boolean = false,
    rightIndex: Expression | null = null
  ) {
    this.Token = token;
    this.Left = left;
    this.Index = index;
    this.HasColon = hasColon;
    this.RightIndex = rightIndex;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    let index = this.Index ? `:${this.Index.String()}` : null;
    let rightIndex = this.RightIndex ? `:${this.RightIndex.String()}` : null;
    return `(${this.Left.String()}[${index}${rightIndex}])`;
  }
}

export class EscapeLiteral implements Expression {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Token.Literal;
  }
}

export class DisplayStatement implements Statement {
  Token: Token;
  Args: (Expression | Identifier)[];

  constructor(token: Token, args: (Expression | Identifier)[]) {
    this.Token = token;
    this.Args = args;
  }

  TokenLiteral(): string {
    return this.Token.Literal;
  }

  String(): string {
    const displayValues = this.Args.map((v) => v.String()).join(', ');
    return `DISPLAY: ${displayValues}`;
  }
}

export class NewLine implements Statement {
  Token: Token;
  Value: string;

  constructor(token: Token, value: string) {
    this.Token = token;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Value;
  }
}

export class ColonExpression implements Expression {
  Token: Token;
  Function: Expression;
  Arguments: Expression[];

  constructor(token: Token, func: Expression, args: Expression[] = []) {
    this.Token = token;
    this.Function = func;
    this.Arguments = args;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    let args: string[] = this.Arguments.map((a) => a.String());

    return `${this.Function.String()}(${args.join(', ')})`;
  }
}

export class AssignmentStatement implements Statement {
  Token: Token;
  Name: Identifier;
  Value: Expression | Identifier;

  constructor(token: Token, name: Identifier, value: Expression | Identifier) {
    this.Token = token;
    this.Name = name;
    this.Value = value;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return `${this.Name.String()} = ${this.Value.String()};`;
  }
}

export class ScanStatement implements Statement {
  Token: Token;
  Names: Identifier[];

  constructor(token: Token, names: Identifier[]) {
    this.Token = token;
    this.Names = names;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return `${this.TokenLiteral()} ${this.Names.map((n) => n.String()).join(
      ', '
    )};`;
  }
}

export class IncrementExpression implements Expression {
  Token: Token;
  Name: Identifier;
  Prefix: boolean; // --i vs i++

  constructor(token: Token, name: Identifier, prefix: boolean) {
    this.Token = token;
    this.Name = name;
    this.Prefix = prefix;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Prefix ? `(++${this.Name})` : `(${this.Name}++)`;
  }
}

export class DecrementExpression implements Expression {
  Token: Token;
  Name: Identifier;
  Prefix: boolean; // --i vs i++

  constructor(token: Token, name: Identifier, prefix: boolean) {
    this.Token = token;
    this.Name = name;
    this.Prefix = prefix;
  }

  TokenLiteral() {
    return this.Token.Literal;
  }

  String() {
    return this.Prefix ? `(--${this.Name})` : `(${this.Name}--)`;
  }
}
