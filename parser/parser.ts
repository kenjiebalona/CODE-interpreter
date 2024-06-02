import {
  AssignmentStatement,
  AstBoolean,
  ASTProgram,
  BlockStatement,
  BoolStatement,
  CallExpression,
  CharLiteral,
  CharStatement,
  ColonExpression,
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
  IndexExpression,
  InfixExpression,
  IntegerLiteral,
  INTStatement,
  NewLine,
  PrefixExpression,
  ReturnStatement,
  ScanStatement,
  Statement,
  StringLiteral,
  VariableDeclaration,
  WhileLiteral,
} from '../ast/ast';
import { NULL } from '../evaluator/evaluator';
import Lexer from '../lexer/lexer';
import Token, { TokenType, TokenTypeName } from '../token/token';

export const LOWEST = 1,
  LOR = 2, // or
  LAND = 3, // and
  EQUALS = 4, // ==
  LESSGREATER = 5, // > or <
  SUM = 6, // +
  PRODUCT = 7, // *
  PREFIX = 8, // X or !X NOT
  CALL = 9; // myFunction(X)

export const precedences: { [index: string]: number } = {
  [TokenType.LOR]: EQUALS,
  [TokenType.LAND]: EQUALS,
  [TokenType.NOT]: PREFIX,
  [TokenType.EQ]: EQUALS,
  [TokenType.NOT_EQ]: EQUALS,
  [TokenType.LT]: LESSGREATER,
  [TokenType.LTE]: LESSGREATER,
  [TokenType.GT]: LESSGREATER,
  [TokenType.GTE]: LESSGREATER,
  [TokenType.PLUS]: SUM,
  [TokenType.MINUS]: SUM,
  [TokenType.SLASH]: PRODUCT,
  [TokenType.ASTERISK]: PRODUCT,
  [TokenType.REM]: PRODUCT,
  [TokenType.LPAREN]: CALL,
};

export default class Parser {
  l: Lexer;
  errors: string[] = [];
  comments: string[] = [];

  curToken: Token;
  peekToken: Token;
  ifStarted: boolean = false;
  hasStarted: boolean = false;
  hasEnded: boolean = false;
  whileStarted: boolean = false;
  executable: boolean = false;

  prefixParseFns: { [index: string]: Function } = {};
  infixParseFns: { [index: string]: Function } = {};

  constructor(lexer: Lexer) {
    this.l = lexer;

    this.registerPrefix(TokenType.COMMENT, this.parseComment.bind(this));
    this.registerPrefix(TokenType.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(TokenType.INCREMENT, this.parsePreIncrement.bind(this));
    this.registerPrefix(TokenType.DECREMENT, this.parsePreDecrement.bind(this));
    this.registerPrefix(TokenType.INTEGER, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(
      TokenType.FLOATINGPOINT,
      this.parseFloatLiteral.bind(this)
    );
    this.registerPrefix(
      TokenType.CHARACTER,
      this.parseCharacterLiteral.bind(this)
    );
    this.registerPrefix(TokenType.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(TokenType.DISPLAY, this.parseDisplay.bind(this));
    this.registerPrefix(TokenType.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.NOT, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.NEWLINE, this.parseNewLine.bind(this));
    this.registerPrefix(TokenType.BEGIN, this.parseBlockStatement.bind(this));
    this.registerPrefix(TokenType.END, this.parseBlockStatement.bind(this));

    this.registerPrefix(TokenType.TRUE, this.parseBoolean.bind(this));
    this.registerPrefix(TokenType.FALSE, this.parseBoolean.bind(this));

    this.registerPrefix(
      TokenType.LPAREN,
      this.parseGroupedExpression.bind(this)
    );
    this.registerPrefix(TokenType.COLON, this.parseColonExpression.bind(this));

    this.registerPrefix(TokenType.IF, this.parseIfExpression.bind(this));
    this.registerPrefix(
      TokenType.FUNCTION,
      this.parseFunctionLiteral.bind(this)
    );
    this.registerPrefix(
      TokenType.LBRACKET,
      this.parseEscapeExpression.bind(this)
    );
    this.registerPrefix(TokenType.WHILE, this.parseWhileLiteral.bind(this));

    [
      TokenType.PLUS,
      TokenType.MINUS,
      TokenType.SLASH,
      TokenType.ASTERISK,
      TokenType.EQ,
      TokenType.NOT_EQ,
      TokenType.LT,
      TokenType.LTE,
      TokenType.GT,
      TokenType.GTE,
      TokenType.REM,
      TokenType.LAND,
      TokenType.LOR,
    ].forEach((value) =>
      this.registerInfix(value, this.parseInfixExpression.bind(this))
    );

    this.registerInfix(TokenType.LPAREN, this.parseCallExpression.bind(this));
    this.registerInfix(TokenType.COLON, this.parseColonExpression.bind(this));

    this.peekToken = this.l.NextToken();
    this.curToken = this.peekToken;
    this.peekToken = this.l.NextToken();
  }

  Errors() {
    return this.errors;
  }

  nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.l.NextToken();
  }

  ParseProgram() {
    let program = new ASTProgram();
    let inCodeBlock = false;

    while (!this.curTokenIs(TokenType.EOF)) {
      if (
        this.curTokenIs(TokenType.BEGIN) &&
        this.peekTokenIs(TokenType.CODE)
      ) {
        inCodeBlock = true;
        this.nextToken();
        this.nextToken();
        continue;
      }
      while (!this.curTokenIs(TokenType.EOF)) {
        if (
          this.curTokenIs(TokenType.END) &&
          this.peekTokenIs(TokenType.CODE)
        ) {
          inCodeBlock = false;
          this.nextToken();
          this.nextToken();
          break;
        } else {
          const stmt = this.parseStatement();
          if (stmt !== null) {
            program.Statements.push(stmt);
          }
          this.nextToken();
        }
      }
      try {
        if (!inCodeBlock && !this.curTokenIs(TokenType.EOF)) {
          throw new Error(
            'Syntax Error: Code outside of BEGIN CODE and END CODE block.'
          );
        }
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        } else {
          console.log('An unknown error occurred');
        }
      }

      if (!this.curTokenIs(TokenType.EOF)) {
        this.nextToken();
      }
    }
    // try {
    //   if (inCodeBlock) {
    //     throw new Error('Syntax Error: Missing END CODE block before EOF.');
    //   }
    // } catch(err) {
    //   if(err instanceof Error) {
    //     console.log(err.message)
    //   }
    // }


    return program;
  }

  curTokenIs(t: TokenTypeName) {
    return this.curToken.Type === t;
  }

  peekTokenIs(t: TokenTypeName) {
    return this.peekToken.Type === t;
  }

  private isIgnorableToken(token: Token): boolean {
    return token.Type === TokenType.COMMENT;
  }

  expectPeek(t: TokenTypeName) {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  peekError(t: TokenTypeName): void {
    if (this.peekToken === null) return;

    let msg = this.formatError(
      this.peekToken,
      `expected next token to be ${t}, got ${this.peekToken.Type} instead`
    );
    this.errors.push(msg);
  }

  formatError(t: Token, msg: string): string {
    return `${msg} at ${t.Position.String()}`;
  }

  parseStatement(): Statement | null {
    switch (this.curToken.Type) {
      case TokenType.INT:
        return this.parseINTStatement();
      case TokenType.BOOL:
        return this.parseBoolStatement();
      case TokenType.FLOAT:
        return this.parseFloatStatement();
      case TokenType.CHAR:
        return this.parseCharStatement();
      case TokenType.DISPLAY:
        return this.parseDisplay();
      case TokenType.SCAN:
        return this.parseScan();
      // case TokenType.WHILE:
      //   return this.parseWhileStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        if (
          this.curTokenIs(TokenType.IDENT) &&
          this.peekTokenIs(TokenType.ASSIGN)
        ) {
          return this.parseAssignmentStatement();
        }
        return this.parseExpressionStatement();
    }
  }

  // parseINTStatement(): Statement | null {
  //   let curToken = this.curToken;
  //   let index: IndexExpression | null = null;

  //   if (!this.expectPeek(TokenType.IDENT)) {
  //     return null;
  //   }

  //   let name = new Identifier(this.curToken, this.curToken.Literal);

  //   if (this.peekTokenIs(TokenType.LBRACKET)) {
  //     this.nextToken();
  //     index = this.parseIndexExpression(name);
  //   }

  //   let value: Expression;
  //   if (this.peekTokenIs(TokenType.ASSIGN)) {
  //     this.nextToken();
  //     this.nextToken();
  //     value = this.parseExpression(LOWEST);
  //   } else {
  //     value = new IntegerLiteral(this.curToken, 0);
  //   }

  //   if (this.peekTokenIs(TokenType.SEMICOLON)) {
  //     this.nextToken();
  //   }
  //   return new INTStatement(curToken, name, value, index);
  // }
  // parseINTStatement(): Statement | null {
  //   let curToken = this.curToken;
  //   let identifiers: {
  //     name: Identifier;
  //     value: Expression;
  //     index: IndexExpression | null;
  //   }[] = [];

  //   if (!this.expectPeek(TokenType.IDENT)) {
  //     return null;
  //   }

  //   while (true) {
  //     let name = new Identifier(this.curToken, this.curToken.Literal);
  //     let index: IndexExpression | null = null;

  //     if (this.peekTokenIs(TokenType.LBRACKET)) {
  //       this.nextToken();
  //       index = this.parseIndexExpression(name);
  //     }

  //     let value: Expression;
  //     if (this.peekTokenIs(TokenType.ASSIGN)) {
  //       this.nextToken();
  //       this.nextToken();
  //       value = this.parseExpression(LOWEST);
  //     } else {
  //       value = new IntegerLiteral(this.curToken, 0);
  //     }

  //     identifiers.push({ name, value, index });

  //     if (this.peekTokenIs(TokenType.COMMA)) {
  //       this.nextToken();
  //       this.nextToken();
  //     } else {
  //       break;
  //     }
  //   }

  //   if (this.peekTokenIs(TokenType.SEMICOLON)) {
  //     this.nextToken();
  //   }
  //   console.log(identifiers)
  //   return new INTStatement(curToken, identifiers);
  // }
  private parseINTStatement(): INTStatement | null {
    const declarations: VariableDeclaration[] = [];
    let initialToken = this.curToken;

    do {
      this.nextToken();

      if (!this.curTokenIs(TokenType.IDENT)) {
        return null;
      }

      let identifier = new Identifier(this.curToken, this.curToken.Literal);

      let initialValue: Expression;
      if (this.peekTokenIs(TokenType.ASSIGN)) {
        this.nextToken();
        this.nextToken();
        initialValue = this.parseExpression(LOWEST);
      } else {
        initialValue = new IntegerLiteral(this.curToken, 0);
      }

      declarations.push({ identifier, initialValue });

      if (this.peekTokenIs(TokenType.COMMA)) {
        this.nextToken();
      } else {
        break;
      }
    } while (
      !this.curTokenIs(TokenType.SEMICOLON) &&
      !this.curTokenIs(TokenType.EOF)
    );

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return new INTStatement(initialToken, declarations);
  }

  parseReturnStatement() {
    let stmt = new ReturnStatement(this.curToken);

    this.nextToken();

    stmt.ReturnValue = this.parseExpression(LOWEST);

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  // parseBoolStatement(): Statement | null {
  //   let curToken = this.curToken;
  //   let index: IndexExpression | null = null;

  //   if (!this.expectPeek(TokenType.IDENT)) {
  //     return null;
  //   }

  //   let name = new Identifier(this.curToken, this.curToken.Literal);

  //   if (this.peekTokenIs(TokenType.LBRACKET)) {
  //     this.nextToken();
  //     index = this.parseIndexExpression(name);
  //   }

  //   let value: Expression;
  //   if (this.peekTokenIs(TokenType.ASSIGN)) {
  //     this.nextToken();
  //     this.nextToken();
  //     value = this.parseExpression(LOWEST);
  //   } else {
  //     value = new AstBoolean(this.curToken, false);
  //   }

  //   if (this.peekTokenIs(TokenType.SEMICOLON)) {
  //     this.nextToken();
  //   }

  //   return new INTStatement(curToken, name, value, index);
  // }

  parseBoolStatement(): Statement | null {
    const declarations: VariableDeclaration[] = [];
    let initialToken = this.curToken;

    do {
      this.nextToken();

      if (!this.curTokenIs(TokenType.IDENT)) {
        return null;
      }

      let identifier = new Identifier(this.curToken, this.curToken.Literal);

      let initialValue: Expression;
      if (this.peekTokenIs(TokenType.ASSIGN)) {
        this.nextToken();
        this.nextToken();
        initialValue = this.parseExpression(LOWEST);
      } else {
        initialValue = new AstBoolean(this.curToken, false);
      }

      declarations.push({ identifier, initialValue });

      if (this.peekTokenIs(TokenType.COMMA)) {
        this.nextToken();
      } else {
        break;
      }
    } while (
      !this.curTokenIs(TokenType.SEMICOLON) &&
      !this.curTokenIs(TokenType.EOF)
    );

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return new INTStatement(initialToken, declarations);
  }

  // parseFloatStatement(): Statement | null {
  //   let curToken = this.curToken;
  //   let index: IndexExpression | null = null;

  //   if (!this.expectPeek(TokenType.IDENT)) {
  //     return null;
  //   }

  //   let name = new Identifier(this.curToken, this.curToken.Literal);

  //   if (this.peekTokenIs(TokenType.LBRACKET)) {
  //     this.nextToken();
  //     index = this.parseIndexExpression(name);
  //   }

  //   let value: Expression;
  //   if (this.peekTokenIs(TokenType.ASSIGN)) {
  //     this.nextToken();
  //     this.nextToken();
  //     value = this.parseExpression(LOWEST);
  //   } else {
  //     value = new FloatLiteral(this.curToken, 0.0);
  //   }

  //   if (this.peekTokenIs(TokenType.SEMICOLON)) {
  //     this.nextToken();
  //   }

  //   return new INTStatement(curToken, name, value, index);
  // }

  parseFloatStatement(): Statement | null {
    const declarations: VariableDeclaration[] = [];
    let initialToken = this.curToken;

    do {
      this.nextToken();

      if (!this.curTokenIs(TokenType.IDENT)) {
        return null;
      }

      let identifier = new Identifier(this.curToken, this.curToken.Literal);

      let initialValue: Expression;
      if (this.peekTokenIs(TokenType.ASSIGN)) {
        this.nextToken();
        this.nextToken();
        initialValue = this.parseExpression(LOWEST);
      } else {
        initialValue = new FloatLiteral(this.curToken, 0.0);
      }

      declarations.push({ identifier, initialValue });

      if (this.peekTokenIs(TokenType.COMMA)) {
        this.nextToken();
      } else {
        break;
      }
    } while (
      !this.curTokenIs(TokenType.SEMICOLON) &&
      !this.curTokenIs(TokenType.EOF)
    );

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return new INTStatement(initialToken, declarations);
  }

  // parseCharStatement(): Statement | null {
  //   let curToken = this.curToken;
  //   let index: IndexExpression | null = null;

  //   if (!this.expectPeek(TokenType.IDENT)) {
  //     return null;
  //   }

  //   let name = new Identifier(this.curToken, this.curToken.Literal);

  //   if (this.peekTokenIs(TokenType.LBRACKET)) {
  //     this.nextToken();
  //     index = this.parseIndexExpression(name);
  //   }

  //   let value: Expression;
  //   if (this.peekTokenIs(TokenType.ASSIGN)) {
  //     this.nextToken();
  //     this.nextToken();
  //     value = this.parseExpression(LOWEST);
  //   } else {
  //     value = new CharLiteral(this.curToken, '');
  //   }

  //   if (this.peekTokenIs(TokenType.SEMICOLON)) {
  //     this.nextToken();
  //   }

  //   return new INTStatement(curToken, name, value, index);
  // }

  parseCharStatement(): Statement | null {
    const declarations: VariableDeclaration[] = [];
    let initialToken = this.curToken;

    do {
      this.nextToken();

      if (!this.curTokenIs(TokenType.IDENT)) {
        return null;
      }

      let identifier = new Identifier(this.curToken, this.curToken.Literal);

      let initialValue: Expression;
      if (this.peekTokenIs(TokenType.ASSIGN)) {
        this.nextToken();
        this.nextToken();
        initialValue = this.parseExpression(LOWEST);
      } else {
        initialValue = new CharLiteral(this.curToken, '');
      }

      declarations.push({ identifier, initialValue });

      if (this.peekTokenIs(TokenType.COMMA)) {
        this.nextToken();
      } else {
        break;
      }
    } while (
      !this.curTokenIs(TokenType.SEMICOLON) &&
      !this.curTokenIs(TokenType.EOF)
    );

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }
    return new INTStatement(initialToken, declarations);
  }

  parseExpressionStatement() {
    let curToken = this.curToken;

    let Expression = this.parseExpression(LOWEST);

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return new ExpressionStatement(curToken, Expression);
  }

  parseExpression(precedence: number) {
    if (!this.prefixParseFns[this.curToken.Type]) {
      this.noPrefixParseFnError(this.curToken);
      return null;
    }

    let prefix = this.prefixParseFns[this.curToken.Type];
    let leftExp = prefix();

    while (
      !this.peekTokenIs(TokenType.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      if (!this.infixParseFns[this.peekToken.Type]) {
        return leftExp;
      }

      let infix = this.infixParseFns[this.peekToken.Type];

      this.nextToken();

      leftExp = infix(leftExp);
    }
    return leftExp;
  }

  peekPrecedence() {
    if (this.peekToken === null) return LOWEST;

    if (precedences[this.peekToken.Type])
      return precedences[this.peekToken.Type];

    return LOWEST;
  }

  // [1], [1:], [:1]
  // 'abcd'[1] => 'b'
  // 'abcd'[:2] => 'ab'
  // 'abcd'[1:3] => 'bc'
  // 'abcd'[2:] => 'cd'
  // ['a', 'b', 'c', 'd'][:2]
  parseIndexExpression(left: Expression): IndexExpression | null {
    let curToken = this.curToken;

    this.nextToken();

    let exp = new IndexExpression(curToken, left);

    // [1?]
    if (!this.curTokenIs(TokenType.COLON)) {
      exp.Index = this.parseExpression(LOWEST);
      this.nextToken();
    }

    // [?:]
    if (this.curTokenIs(TokenType.COLON)) {
      this.nextToken();
      exp.HasColon = true;
    }

    // // [?1]
    if (!this.curTokenIs(TokenType.RBRACKET)) {
      exp.RightIndex = this.parseExpression(LOWEST);
      this.nextToken();
    }

    if (!this.curTokenIs(TokenType.RBRACKET)) {
      return null;
    }

    return exp;
  }

  parseComment() {
    this.comments.push(this.curToken.Literal);
    return new Comment(this.curToken, this.curToken.Literal);
  }

  registerPrefix(tokenType: TokenTypeName, fn: Function) {
    this.prefixParseFns[tokenType] = fn;
  }

  registerInfix(tokenType: TokenTypeName, fn: Function) {
    this.infixParseFns[tokenType] = fn;
  }

  noPrefixParseFnError(t: Token) {
    let msg = this.formatError(
      t,
      `no prefix parse function for ${t.Type} found: ${t.Literal}`
    );
    this.errors.push(msg);
  }

  parseInfixExpression(left: Expression) {
    let curToken = this.curToken;
    let curLiteral = this.curToken.Literal;

    let precedence = this.curPrecedence();
    this.nextToken();

    return new InfixExpression(
      curToken,
      left,
      curLiteral,
      this.parseExpression(precedence)
    );
  }

  parsePrefixExpression() {
    let curToken = this.curToken;
    let curLiteral = this.curToken.Literal;
    this.nextToken();

    return new PrefixExpression(
      curToken,
      curLiteral,
      this.parseExpression(PREFIX)
    );
  }

  curPrecedence() {
    if (precedences[this.curToken.Type]) return precedences[this.curToken.Type];

    return LOWEST;
  }

  parseIdentifier() {
    let ident = new Identifier(this.curToken, this.curToken.Literal);

    if (this.peekTokenIs(TokenType.INCREMENT)) {
      this.nextToken();
      return new IncrementExpression(this.curToken, ident, false);
    } else if (this.peekTokenIs(TokenType.DECREMENT)) {
      this.nextToken();
      return new DecrementExpression(this.curToken, ident, false);
    }

    return ident;
  }

  parseIdentifier2() {
    let ident = new Identifier(this.curToken, this.curToken.Literal);

    // if (this.peekTokenIs(TokenType.INCREMENT)) {
    //   this.nextToken();
    //   return new IncrementExpression(this.curToken, ident, false);
    // } else if (this.peekTokenIs(TokenType.DECREMENT)) {
    //   this.nextToken();
    //   return new DecrementExpression(this.curToken, ident, false);
    // }

    return ident;
  }

  parseIntegerLiteral() {
    try {
      let value = parseInt(this.curToken.Literal, 10);
      let lit = new IntegerLiteral(this.curToken, value);
      return lit;
    } catch (e) {
      let msg = this.formatError(
        this.curToken,
        `could not parse ${this.curToken.Literal} as integer`
      );
      this.errors.push(msg);
      return null;
    }
  }

  parseFloatLiteral() {
    try {
      let value = parseFloat(this.curToken.Literal);
      let lit = new FloatLiteral(this.curToken, value);
      return lit;
    } catch (e) {
      let msg = this.formatError(
        this.curToken,
        `could not parse ${this.curToken.Literal} as float`
      );
      this.errors.push(msg);
      return null;
    }
  }

  parseCharacterLiteral() {
    return new CharLiteral(this.curToken, this.curToken.Literal);
  }

  parseStringLiteral() {
    return new StringLiteral(this.curToken, this.curToken.Literal);
  }

  parseBoolean() {
    return new AstBoolean(this.curToken, this.curTokenIs(TokenType.TRUE));
  }

  parseGroupedExpression() {
    this.nextToken();

    let exp = this.parseExpression(LOWEST);

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    return exp;
  }

  parseIfExpression() {
    let curToken = this.curToken;
    if (!this.expectPeek(TokenType.LPAREN) || !this.peekTokenIs) {
      return null;
    }

    this.nextToken();
    let Condition = this.parseExpression(LOWEST);
    // if (!this.expectPeek(TokenType.RPAREN)) {
    //   return null;
    // }

    this.nextToken();
    let Consequence = this.parseBlockStatement();
    let Alternative = null;
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken();
      Alternative = this.parseBlockStatement();
    }
    let res = new IfExpression(curToken, Condition, Consequence, Alternative);
    return res;
  }

  // parseIfExpression() {
  //   let curToken = this.curToken;

  //   if (!this.expectPeek(TokenType.LPAREN)) {
  //     return null;
  //   }

  //   this.nextToken();
  //   let Condition = this.parseExpression(LOWEST);

  //   if (!this.expectPeek(TokenType.RPAREN)) {
  //     return null;
  //   }

  //   let Consequence: BlockStatement | null = null;
  //   if (!this.expectPeek(TokenType.BEGIN)) {
  //     const singleStatement = this.parseStatement();
  //     Consequence = new BlockStatement(this.curToken, [singleStatement]);
  //   } else {
  //     this.nextToken();
  //     Consequence = this.parseBlockStatement();
  //   }

  //   let Alternative = null;
  //   if (this.peekTokenIs(TokenType.ELSE)) {
  //     this.nextToken();

  //     Alternative = !this.expectPeek(TokenType.BEGIN)
  //       ? new BlockStatement(this.curToken, [this.parseStatement()])
  //       : this.parseBlockStatement();
  //   }

  //   return new IfExpression(curToken, Condition, Consequence, Alternative);
  // }
  // Original
  parseBlockStatement() {
    let block = new BlockStatement(this.curToken);
    this.nextToken();
    // console.log(block)
    if(this.curTokenIs(TokenType.IF) || this.curTokenIs(TokenType.WHILE)) this.nextToken();

    while (!this.curTokenIs(TokenType.END)) {
      if(this.curTokenIs(TokenType.EOF)) return block;
      let stmt = this.parseStatement();
      console.log(stmt);
      if (stmt !== null) {
        block.Statements.push(stmt);
      }
      this.nextToken();
    }
    return block;
  }


  parseFunctionLiteral() {
    let curToken = this.curToken;

    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    let Parameters = this.parseFunctionParameters();

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    let Body = this.parseBlockStatement();
    return new FunctionLiteral(curToken, Parameters, Body);
    // return null;
  }

  parseFunctionParameters(): Identifier[] {
    let identifiers: Identifier[] = [];

    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    let ident = new Identifier(this.curToken, this.curToken.Literal);
    identifiers.push(ident);

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();

      ident = new Identifier(this.curToken, this.curToken.Literal);
      identifiers.push(ident);
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return [];
    }

    return identifiers;
  }

  parseWhileLiteral() {
    let curToken = this.curToken;
    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    let Expression = this.parseExpression(LOWEST);
    // if (!this.expectPeek(TokenType.BEGIN)) {
    //   return null;
    // }
    let Body = this.parseBlockStatement();
    let res = new WhileLiteral(curToken, Expression, Body);
    // console.log(res);
    return res;
  }

  parseCallExpression(func: Expression) {
    return new CallExpression(
      this.curToken,
      func,
      this.parseExpressionList(TokenType.RPAREN)
    );
  }

  parseColonExpression(func: Expression) {
    return new ColonExpression(
      this.curToken,
      func,
      this.parseColonExpressionList(TokenType.COLON)
    );
  }

  parseExpressionList(end: TokenTypeName): Expression[] {
    let list: Expression[] = [];

    if (this.peekTokenIs(end)) {
      this.nextToken();
      return list;
    }

    this.nextToken();
    list.push(this.parseExpression(LOWEST));

    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();
      list.push(this.parseExpression(LOWEST));
    }

    if (!this.expectPeek(end)) {
      return [];
    }

    return list;
  }

  parseColonExpressionList(end: TokenTypeName): Expression[] {
    let list: Expression[] = [];

    this.nextToken();
    list.push(this.parseExpression(LOWEST));

    while (this.peekTokenIs(TokenType.CONCAT)) {
      this.nextToken();
      this.nextToken();
      list.push(this.parseExpression(LOWEST));
    }

    // if (!this.expectPeek(end)) {
    //   return [];
    // }

    return list;
  }

  parseEscapeExpression(): EscapeLiteral | null {
    this.nextToken();
    const escapeChar = this.curToken.Literal;
    this.nextToken();
    if (!this.curTokenIs(TokenType.RBRACKET)) {
      return null;
    }
    return new EscapeLiteral(this.curToken, escapeChar);
  }

  parseDisplay() {
    let curToken = this.curToken;
    let displayParts = [];

    if (!this.expectPeek(TokenType.COLON)) {
      this.errors.push(
        'Expected next token to be :, got ' +
          this.peekToken.Literal +
          ' instead'
      );
      return null;
    }

    this.nextToken();
    if (this.curTokenIs(TokenType.NEWLINE) || this.curTokenIs(TokenType.EOL)) {
      displayParts.push(this.parseNewLine());
    } else {
      if (this.peekTokenIs(TokenType.HASH)) {
        this.nextToken();
        this.nextToken();
        displayParts.push(new EscapeLiteral(new Token(']', ']'), '#'));
      } else {
        let firstPart = this.parseExpression(LOWEST);
        displayParts.push(firstPart);
      }
    }

    while (this.peekTokenIs(TokenType.CONCAT)) {
      this.nextToken();
      this.nextToken();
      if (
        this.curTokenIs(TokenType.NEWLINE) ||
        this.curTokenIs(TokenType.EOL)
      ) {
        displayParts.push(this.parseNewLine());
        continue;
      }
      let part = this.parseExpression(LOWEST);
      if (!(part instanceof Comment)) {
        displayParts.push(part);
      }
    }

    return new DisplayStatement(curToken, displayParts);
  }

  parseNewLine() {
    return new NewLine(this.curToken, '\n');
  }

  parseAssignmentStatement(): AssignmentStatement | null {
    let curToken = this.curToken;

    let name = this.parseIdentifier2();

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }
    this.nextToken();
    let value = this.parseExpression(LOWEST);
    return new AssignmentStatement(curToken, name, value);
  }

  parseScan() {
    let curToken = this.curToken;
    this.nextToken();

    const names: Identifier[] = [];

    do {
      if (!this.expectPeek(TokenType.IDENT)) {
        return null;
      }

      const ident = this.parseIdentifier() as Identifier;
      names.push(ident);

      if (!this.peekTokenIs(TokenType.COMMA)) {
        break;
      }
      this.nextToken();
    } while ((this.nextToken(), !this.curTokenIs(TokenType.SEMICOLON)));

    return new ScanStatement(curToken, names);
  }

  parseWhileStatement() {
    return null;
  }

  parsePreIncrement() {
    this.nextToken();
    let ident = new Identifier(this.curToken, this.curToken.Literal);
    return new IncrementExpression(this.curToken, ident, true);
  }

  parsePreDecrement() {
    this.nextToken();
    let ident = new Identifier(this.curToken, this.curToken.Literal);
    return new DecrementExpression(this.curToken, ident, true);
  }
}
