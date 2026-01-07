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

function comma_sep(rule) {
  return seq(rule, repeat(seq(',', rule)));
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
      $.header_instruction,
      $.ifelse_block,
      $.simul_block,
      $.include_instruction,
      $.init_block,
      $.next_test_instruction,
      $.service_block,
      $.stub_instruction,
      $.termination_block,
      $.test_block,
      $.use_instruction,
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
      field('function', seq(
         optional(seq(field('stub_name', $.identifier), '.')),
         field('function_name', $.identifier)
      )),
      optional(field('stub_dim', alias(/\d+/, $.number))),
      repeat(choice(
        $.stub_code,
        //$.native_code, TODO: check if possible to have both
        $.comment_instruction,
        $.other_comment_instruction,
        $.ifelse_block,
        $.simul_block,
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
        $.other_comment_instruction,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.stub_instruction,
        $.ifelse_block,
        $.simul_block,
        $.use_instruction,
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
        $.other_comment_instruction,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.stub_instruction,
        $.format_instruction,
        $.ifelse_block,
        $.simul_block,
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
    header_instruction: $ => seq(
      alias(caseInsensitive('HEADER'), 'HEADER'),
      optional(
        seq(
          field('module_name', $.identifier), // module_name
          ',',
          optional(field('module_version', $.identifier)), // module_version
          ',',
          optional(field('test_plan_version', $.identifier))  // test_plan_version
        )
      )
    ),

    // IF ELSE BLOCK
    ifelse_block: $ => seq(
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
    next_test_instruction: $ => seq(
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
        $.service_type_instruction,
        $.test_block,
        $.environment_block,
        $.comment_instruction,
        $.other_comment_instruction,
        $.native_code,
        $.ifelse_block,
        $.simul_block,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.use_instruction,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('SERVICE'), 'SERVICE'),
    ),
    service_type_instruction: $ => seq(
      alias(caseInsensitive('SERVICE_TYPE'), 'SERVICE_TYPE'),
      optional(seq(
        field('service_name', $.identifier),
        repeat(seq(',', field('service_name', $.identifier))),
      )),
    ),

    // SIMUL BLOCK
    simul_block: $ => seq(
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
        $.next_test_instruction,
        $.ifelse_block,
        $.simul_block,
        $.comment_instruction,
        $.other_comment_instruction,
        $.var_instruction,
        $.array_instruction,
        $.str_instruction,
        $.native_code,
        $.use_instruction,
      )),
      alias(caseInsensitive('END'), 'END'),
      alias(caseInsensitive('TEST'), 'TEST'),
    ),

    // USE
    use_instruction: $ => seq(
      alias(caseInsensitive('USE'), 'USE'),
      field('name', $.identifier),
      optional(seq(
        '(',
        field('expression', $.identifier),
        repeat(seq(',', field('expression', $.identifier))),
        ')'
      )),
    ),

    // VAR ARRAY STR (simple)
    var_instruction: $ => seq(
      alias(caseInsensitive('VAR'), 'VAR'),
      choice(
        $._var_triplet,
        $._var_doublet,
      ),
    ),
    array_instruction: $ => seq(
      alias(caseInsensitive('ARRAY'), 'ARRAY'),
      choice(
        $._var_triplet,
        $._var_doublet,
      ),
    ),
    str_instruction: $ => seq(
      alias(caseInsensitive('STR'), 'STR'),
      choice(
        $._var_triplet,
        $._var_doublet,
      ),
    ),

    other_comment_instruction: $ => seq(
        choice('--', '++'),
        field('text', $.rest_of_line)
    ),

    native_code: $ => prec(1, seq(
      field('marker', choice('#', '@')),
      field('content', alias(/[^\r\n]*/, $.c_code)) 
    )),

    stub_code: $ => prec(2, seq(
      field('marker', choice('#', '@')),
      $.stub_call_signature
    )),
    stub_call_signature: $ => seq(
      optional(field('type', $.expression)),
      field('function', $.expression),
      '(',
      optional(comma_sep($._stub_parameter)),
      ')'
    ),
    _stub_parameter: $ => seq(
      optional(field('mode', choice(
        alias('_in', $.mode_in),
        alias('_out', $.mode_out),
        alias('_inout', $.mode_inout),
        alias('_no', $.mode_no)
      ))),
      field('value', $.expression)
    ),

    // Helpers
    _var_triplet: $ => prec(2, seq(
      field('variable', $.expression),
      ',',
      field('initialization', $.init_spec),
      ',',
      field('expected_value', $.expected_spec),
    )),
    _var_doublet: $ => prec(1, seq(
      field('expression', $.expression),
      ',',
      field('expected_value', $.expected_spec),
    )),

    init_spec: $ => choice(
      $.init_expression,       // INIT = <expr>
      $.init_in,               // INIT IN { ... }
      $.init_with,             // INIT (...) WITH { ... }
      $.init_from,             // INIT FROM ... TO ...
      $.init_reference         // INIT ==
    ),
    init_expression: $ => seq(
      alias(caseInsensitive('INIT'), 'INIT'),
      '=',
      field('value', $.expression)
    ),
    init_in: $ => seq(
      alias(caseInsensitive('INIT'), 'INIT'),
      alias(caseInsensitive('IN'), 'IN'),
      '{',
      comma_sep($.expression),
      '}'
    ),
    init_with: $ => seq(
      alias(caseInsensitive('INIT'), 'INIT'),
      '(',
      comma_sep($.expression),
      ')',
      alias(caseInsensitive('WITH'), 'WITH'),
      '{',
      comma_sep($.expression),
      '}'
    ),
    init_from: $ => seq(
      alias(caseInsensitive('INIT'), 'INIT'),
      alias(caseInsensitive('FROM'), 'FROM'),
      field('start', $.expression),
      alias(caseInsensitive('TO'), 'TO'),
      field('end', $.expression),
      optional(choice(
        seq(alias(caseInsensitive('STEP'), 'STEP'), field('step', $.expression)),
        seq(alias(caseInsensitive('NB_TIMES'), 'NB_TIMES'), field('count', $.expression)),
        seq(
          alias(caseInsensitive('NB_RANDOM'), 'NB_RANDOM'),
          field('count', $.expression),
          optional(alias(caseInsensitive('BOUNDS'), 'BOUNDS'))
        )
      ))
    ),
    init_reference: $ => seq(
      alias(caseInsensitive('INIT'), 'INIT'),
      '==',
    ),

    expected_spec: $ => choice(
      $.expec_exp,           // EV = <expr>
      $.expec_delta,         // EV = <expr>, DELTA = <delta>
      $.expec_bounds,        // MIN = <expr>, MAX = <expr>
      $.expec_in,            // EV IN { <expr>, ... }
      $.expec_var_in,        // EV ( <var> ) IN { <expr>, ... }
      $.expec_reference      // EV ==
    ),
    expec_exp: $ => seq(
      alias(caseInsensitive('EV'), 'EV'),
      '=',
      field('value', $.expression)
    ),
    expec_delta: $ => seq(
      alias(caseInsensitive('EV'), 'EV'),
      '=',
      field('value', $.expression),
      ',',
      alias(caseInsensitive('DELTA'), 'DELTA'),
      '=',
      field('delta', $.expression),
      optional('%')
    ),
    expec_bounds: $ => seq(
      alias(caseInsensitive('MIN'), 'MIN'),
      '=',
      field('min', $.expression),
      ',',
      alias(caseInsensitive('MAX'), 'MAX'),
      '=',
      field('max', $.expression),
    ),
    expec_in: $ => seq(
      alias(caseInsensitive('EV'), 'EV'),
      alias(caseInsensitive('IN'), 'IN'),
      '{',
      comma_sep($.expression),
      '}',
    ),
    expec_var_in: $ => seq(
      alias(caseInsensitive('EV'), 'EV'),
      '(',
      field('value', $.expression),
      ')',
      alias(caseInsensitive('IN'), 'IN'),
      '{',
      comma_sep($.expression),
      '}',
    ),
    expec_reference: $ => seq(
      alias(caseInsensitive('EV'), 'EV'),
      '==',
    ),

    rest_of_line: $ => /[^\r\n]*/,
    until_new_line: $ => /[^\r\n]+/,

    path_value: $ => choice(
      $.string,
      token(/[a-zA-Z0-9_./\\]+/),
    ),

    identifier: $ => /[a-zA-Z_]\w*/,
    number: $ => choice(
      /0x[0-9a-fA-F]+/,
      /(\d+(\.\d*)?([eE][+-]?\d+)?%?)/
    ),
    string: $ => /"([^"\\]|\\.)*"/,
    char_literal: $ => /'([^'\\]|\\.)'/,
    expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.char_literal,
      $.parenthesized_expression,
      $.call_expression,
      $.subscript_expression,
      $.field_expression,
      $.unary_expression,
      $.binary_expression,
      $.assignment_expression,
      $.range_expression
    ),
    parenthesized_expression: $ => seq('(', $.expression, ')'),
    call_expression: $ => prec(1, seq(
      field('function', $.expression),
      '(',
      optional(comma_sep($.expression)), // Defined below
      ')'
    )),
    subscript_expression: $ => prec(1, seq(
      field('argument', $.expression),
      '[',
      field('index', $.expression),
      ']'
    )),
    field_expression: $ => prec(1, seq(
      field('argument', $.expression),
      choice('.', '->'),
      field('field', $.identifier)
    )),
    unary_expression: $ => prec.right(2, seq(
      choice('*', '&', '!', '-', '~'),
      $.expression
    )),
    binary_expression: $ => prec.left(1, seq(
      $.expression,
      choice('+', '-', '*', '/', '%', '==', '!=', '>', '<', '>=', '<=', '&&', '||', '&', '|', '^'),
      $.expression
    )),
    assignment_expression: $ => prec.right(0, seq(
      $.expression,
      choice('=', '+=', '-='),
      $.expression
    )),
    range_expression: $ => prec.left(1, seq(
      $.expression,
      '..',
      $.expression
    )),
    
  }
});
