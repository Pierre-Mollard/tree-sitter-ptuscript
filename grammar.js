/**
 * @file Parser for the PTUScript language from RTRT
 * @author Pierre Mollard <pierre.mollard@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "ptuscript",

  rules: {

    program: $ => repeat($.statement),
   
    statement: $ => choice(
      $.comment_instruction,
    ),

    comment_instruction: $ => seq(
        'COMMENT',
        optional($.comment_text)
    ),
    comment_text: $ => /[^\r\n]+/,
    
  }
});
