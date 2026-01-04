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
      $.define_stub_block,
      $.element_block,
      $.test_block,
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

    // DEFINE STUB BLOCK
    define_stub_block: $ => seq(
      alias(caseInsensitive('DEFINE'), 'DEFINE'),
      alias(caseInsensitive('STUB'), 'STUB'),
      field('stub_name', $.identifier),
      optional(field('stub_dim', alias(/\d+/, $.number))),
      repeat(choice(
        $.native_code,
        $.comment_instruction,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('DEFINE'), 'DEFINE'),
    ),

    // ELEMENT BLOCK
    element_block: $ => seq(
      alias(caseInsensitive('ELEMENT'), 'ELEMENT'),
      repeat(choice(
        $.native_code,
        $.comment_instruction,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.stub_instruction,
        $.identifier
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('ELEMENT'), 'ELEMENT'),
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
    stub_instruction: $ => alias(caseInsensitive('STUB'), 'STUB'),
    // TODO: TERMINATION
    // TODO: TEST

    test_block: $ => seq(
       'TEST', 
       repeat(choice(
         $.element_block,
         $.comment_instruction // <-- allowed here
       )),
       'END', 'TEST'
    ),
    // TODO: USE
    // TODO: VAR ARRAY STR
    
    var_instruction: $ => alias(caseInsensitive('VAR'), 'VAR'),
    array_instruction: $ => alias(caseInsensitive('ARRAY'), 'ARRAY'),
    str_instruction: $ => alias(caseInsensitive('STR'), 'STR'),

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
    number: $ => /\d+/,
    
    
  }
});
