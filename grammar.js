/**
 * @file Parser for the PTUScript language from RTRT
 * @author Pierre Mollard <pierre.mollard@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

function caseInsensitive(keyword) {
  return new RegExp(
    keyword
      .split('')
      .map(letter => `[${letter.toLowerCase()}${letter.toUpperCase()}]`)
      .join('')
  );
}

module.exports = grammar({
  name: "ptuscript",
  
  // Tell tree sitter that identifier is the word token
  word: $ => $.identifier,

  rules: {

    source_file: $ => repeat($._definition),
  
    // List all definitions (instructions, blocks) here
    _definition: $ => choice(
      $.native_code,
      $.begin_instruction,
      $.comment_instruction,
      $.other_comment_instruction,
      $.header_block,
      $.test_block,
    ),

    // BEGIN
    begin_instruction: $ => alias(caseInsensitive('BEGIN'), 'BEGIN'),

    // COMMENT
    comment_instruction: $ => seq(
        alias(caseInsensitive('COMMENT'), 'COMMENT'),
        field('text', $.rest_of_line)
    ),


    // TODO: DEFINE STUB
    // TODO: ELEMENT

    element_block: $ => seq(
       'ELEMENT', 
       repeat(choice(
         $.comment_instruction
       )),
       'END', 'ELEMENT'
    ),

    // TODO: ENVIRONMENT
    // TODO: FAMILY
    // TODO: FORMAT
    
    // HEADER
    header_block: $ => seq(
      alias(caseInsensitive('HEADER'), 'HEADER'),
      optional(
        seq(
          field('module_name', $.identifier), // module_name
          ',',
          field('module_version', $.identifier), // module_version
          ',',
          field('test_plan_version', $.identifier)  // test_plan_version
        )
      )
    ),

    // TODO: IF ELSE
    // TODO: INCLUDE
    // TODO: INIT
    // TODO: NEXT_TEST
    // TODO: SERVICE

    service_block: $ => seq(
       'SERVICE', 
       repeat(choice(
         $.comment_instruction // <-- allowed here
       )),
       'END', 'SERVICE'
    ),
    // TODO: SIMUL
    // TODO: STUB
    // TODO: TERMINATION
    // TODO: TEST

    test_block: $ => seq(
       'TEST', 
       repeat(choice(
         $.comment_instruction // <-- allowed here
       )),
       'END', 'TEST'
    ),
    // TODO: USE
    // TODO: VAR ARRAY STR
    
          // OTHER COMMENT ?
    other_comment_instruction: $ => seq(
        choice('--', '++'),
        field('text', $.rest_of_line)
    ),


    native_code: $ => seq(
      '#',
      optional($.rest_of_line)
    ),

    rest_of_line: $ => /[^\r\n]*/,

    // C Test Script language identifier (check the doc)
    identifier: $ => /[a-zA-Z0-9_]+/,
    number: $ => /\d+/
    
    
  }
});
