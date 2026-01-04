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
      $.environment_block,
      $.family_instruction,
      $.format_instruction,
      $.header_block,
      $.ifelse_instruction,
      $.simul_instruction,
      $.include_instruction,
      $.init_block,
      $.next_test_block,
      $.service_block,
      $.simul_instruction,
      $.stub_instruction,
      $.termination_block,
      $.test_block,
      $.use_block,
      $.other_comment_instruction,
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
        $.ifelse_instruction,
        $.simul_instruction,
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
        $.ifelse_instruction,
        $.simul_instruction,
        $.use_block,
        $.identifier,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('ELEMENT'), 'ELEMENT'),
    ),

    // ENVIRONMENT BLOCK
    environment_block: $ => seq(
      alias(caseInsensitive('ENVIRONMENT'), 'ENVIRONMENT'),
      field('name', $.identifier),
      optional(seq(
        '(',
        field('parameter', $.identifier),
        repeat(seq(',', field('parameter', $.identifier))),
        ')'
      )),
      repeat(choice(
        $.native_code,
        $.comment_instruction,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.stub_instruction,
        $.format_instruction,
        $.ifelse_instruction,
        $.simul_instruction,
        $.identifier
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('ENVIRONMENT'), 'ENVIRONMENT'),
    ),

    // FAMILY
    family_instruction: $ => seq(
      alias(caseInsensitive('FAMILY'), 'FAMILY'),
      field('family_name', $.identifier), // family_name
      optional(seq(
        repeat(seq(',', field('family_name', $.identifier))),
      )),
    ),

    // FORMAT
    format_instruction: $ => seq(
      alias(caseInsensitive('FORMAT'), 'FORMAT'),
      field('field', $.identifier), // variable, type or field
      '=',
      field('format', alias(/[^\r\n]*/, $.rest_of_line)), // format
    ),

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

    // IF ELSE BLOCK
    ifelse_instruction: $ => seq(
      alias(caseInsensitive('IF'), 'IF'),
      field('condition', alias(/[^\r\n]+/, $.until_new_line)), // C code so anything goes
      field('consequence', alias(repeat($._definition), $.block)),
      optional(seq(
        alias(caseInsensitive('ELSE'), 'ELSE'),
        field('alternative', alias(repeat($._definition), $.block))
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('IF'), 'IF'),
    ),

    // INCLUDE
    include_instruction: $ => seq(
      alias(caseInsensitive('INCLUDE'), 'INCLUDE'),
      optional(choice(
        alias(caseInsensitive('CODE'), 'CODE'),
        alias(caseInsensitive('PTU'), 'PTU'),
      )),
      field('path', $.path_value), // file
    ),

    // INIT BLOCK
    init_block: $ => seq(
      alias(caseInsensitive('INITIALIZATION'), 'INITIALIZATION'),
      repeat(choice(
        $.native_code,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('INITIALIZATION'), 'INITIALIZATION'),
    ),

    // NEXT_TEST
    next_test_block: $ => seq(
      alias(caseInsensitive('NEXT_TEST'), 'NEXT_TEST'),
      optional(seq(
        alias(caseInsensitive('LOOP'), 'LOOP'),
        field('nb', alias(/[^\r\n]+/, $.number_expression)), // integer expression can be C code
      )),
    ),

    // SERVICE BLOCK
    service_block: $ => seq(
      alias(caseInsensitive('SERVICE'), 'SERVICE'),
      field('service_name', $.identifier), // service_name
      repeat(choice(
        $.test_block,
        $.environment_block,
        $.comment_instruction,
        $.native_code,
        $.ifelse_instruction,
        $.simul_instruction,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.use_block,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('SERVICE'), 'SERVICE'),
    ),

    // SIMUL BLOCK
    simul_instruction: $ => seq(
      alias(caseInsensitive('SIMUL'), 'SIMUL'),
      field('consequence', alias(repeat($._definition), $.block)),
      optional(seq(
        alias(caseInsensitive('ELSE_SIMUL'), 'ELSE_SIMUL'),
        field('alternative', alias(repeat($._definition), $.block))
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('SIMUL'), 'SIMUL'),
    ),

    // STUB (simple)
    stub_instruction: $ => seq(
      alias(caseInsensitive('STUB'), 'STUB'),
      field('function', seq(
         optional(seq(field('stub_name', $.identifier), '.')),
         field('function_name', $.identifier)
      )),
      field('calls', alias(/[^\r\n]*/, $.rest_of_line)), // calls
    ),

    // TERMINATION BLOCK
    termination_block: $ => seq(
      alias(caseInsensitive('TERMINATION'), 'TERMINATION'),
      repeat(choice(
        $.native_code,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('TERMINATION'), 'TERMINATION'),
    ),

    // TEST BLOCK
    test_block: $ => seq(
      alias(caseInsensitive('TEST'), 'TEST'),
      field('test_name', $.identifier), // test name
      optional(seq(
        alias(caseInsensitive('LOOP'), 'LOOP'),
        field('nb', alias(/[^\r\n]+/, $.number_expression)), // integer expression can be C code
      )),
      repeat(choice(
        $.element_block,
        $.family_instruction,
        $.next_test_block,
        $.ifelse_instruction,
        $.simul_instruction,
        $.comment_instruction,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.native_code,
        $.use_block,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('TEST'), 'TEST'),
    ),

    // USE
    use_block: $ => seq(
      alias(caseInsensitive('USE'), 'USE'),
      field('name', $.identifier),
      optional(seq(
        '(',
        field('expression', $.identifier),
        repeat(seq(',', field('expression', $.identifier))),
        ')'
      )),
    ),

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
      choice(
        '#',
        '@'
      ),
      optional($.rest_of_line)
    ),

    rest_of_line: $ => /[^\r\n]*/,
    until_new_line: $ => /[^\r\n]+/,

    // String literal
    string: $ => token(seq(
      '"',
      repeat(choice(
        /[^"\\\n]+/,        // Match non-quote, non-backslash, non-newline
        /\\./               // Match escaped characters like \" or \n
      )),
      '"'
    )),

    // C Test Script language identifier (check the doc)
    identifier: $ => /[a-zA-Z0-9_]+/,
    number: $ => /\d+/,
    path_value: $ => choice(
      $.string,
      token(/[a-zA-Z0-9_./\\]+/),
    ),
    
  }
});
