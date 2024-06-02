import Start from './repl/repl';
import process from 'process';
import os from 'os';
import fs from 'fs';

import { NewEnvironment, NewNodeEnvironment } from './object/environment';
import Lexer from './lexer/lexer';
import Parser from './parser/parser';
import Eval from './evaluator/evaluator';
export { NewEnvironment, NewNodeEnvironment, Lexer, Parser, Eval };

import {
  BOOLEAN_OBJ,
  BUILTIN_OBJ,
  ERROR_OBJ,
  COMMENT_OBJ,
  FUNCTION_OBJ,
  INTEGER_OBJ,
  FLOAT_OBJ,
  NULL_OBJ,
  RETURN_VALUE_OBJ,
  STRING_OBJ,
  HASH_OBJ,
} from './object/object';
export const OObject = {
  BOOLEAN_OBJ,
  BUILTIN_OBJ,
  ERROR_OBJ,
  COMMENT_OBJ,
  FUNCTION_OBJ,
  INTEGER_OBJ,
  FLOAT_OBJ,
  NULL_OBJ,
  RETURN_VALUE_OBJ,
  STRING_OBJ,
  HASH_OBJ,
};
let hasErrors: boolean = false;
export function main(argv: string[]): void {
  let output = process.stdout;
  let errors = process.stderr;


  if (argv[2]) {
    // load a file

    let filename: string = argv[2];

    const stream = fs.createReadStream(filename, { encoding: 'utf8' });

    hasErrors = Start(stream, output, errors, true);
  } else {
    // run the REPL

    let username = os.userInfo().username;
    console.log(`Hello ${username}! This is the Code programming language!`);
    console.log('Feel free to type in commands');

    let input = process.stdin;
    input.setEncoding('utf-8');

    hasErrors = Start(input, output, errors, false);
  }

}
// if(!hasErrors) console.log('way error')
// console.error()
// NodeJS runs a REPL or file loader
if (typeof process !== 'undefined' && typeof process.versions.node !== 'undefined') main(process.argv);
