"SERVICE"           @keyword.exception
"SERVICE_TYPE"      @keyword.exception
"INITIALIZATION"    @keyword.exception
"TERMINATION"       @keyword.exception
(service_block service_name: (identifier) @constant.builtin)
(service_type_instruction service_name: (identifier) @constant.builtin)

"TEST"              @keyword.function
"ELEMENT"           @keyword.function
"DEFINE"            @keyword.function
"STUB"              @keyword.function
(test_block    test_name: (identifier) @constant.builtin)

"HEADER"            @preproc
"BEGIN"             @preproc

"DEFINE"            @keyword.macro

"ENVIRONMENT"       @keyword.conditional.ternary
(environment_block name: (identifier) @string.documentation)
(environment_block parameter: (identifier) @string.documentation)
"FAMILY"            @keyword.conditional.ternary
(family_instruction family_name: (identifier) @string.documentation)

"VAR"               @keyword.import
"ARRAY"             @keyword.import
"STR"               @keyword.import

(var_instruction 
  variable: (_) @variable
  initialization: (_) @number
  expected_value: (_) @constant)

(var_instruction 
  expression: (_) @operator
  expected_value: (_) @constant)

(array_instruction 
  variable: (_) @variable
  initialization: (_) @number
  expected_value: (_) @constant)

(array_instruction 
  expression: (_) @operator
  expected_value: (_) @constant)

(str_instruction 
  variable: (_) @variable
  initialization: (_) @number
  expected_value: (_) @constant)

(str_instruction 
  expression: (_) @operator
  expected_value: (_) @constant)

"IF"                @keyword.coroutine
"ELSE"              @keyword.coroutine
"END"               @keyword.coroutine
"SIMUL"             @keyword.coroutine
"ELSE_SIMUL"        @keyword.coroutine
"NEXT_TEST"         @keyword.coroutine

"COMMENT"                   @comment
(comment_instruction)       @comment
(other_comment_instruction) @comment

(mode_in) @type.qualifier
(mode_out) @type.qualifier
(mode_inout) @type.qualifier
(mode_no) @type.qualifier

(identifier) @variable
(string) @string
(number) @number

"INIT" @type.qualifier
"IN" @type.qualifier
"EV" @type.qualifier
"WITH" @keyword
"MIN" @type.qualifier "MAX" @type.qualifier
"FROM" @type.qualifier "TO" @type.qualifier
"STEP" @type.qualifier
"NB_TIMES" @type.qualifier
"CONST" @type.qualifier
"OTHERS" @type.qualifier
"NIL" @type.qualifier
"NONIL" @type.qualifier
"NB_RANDOM" @type.qualifier
"BOUNDS" @type.qualifier
"LOOP" @type.qualifier
"=>" @punctuation.delimiter
"==" @punctuation.delimiter

(identifier) @variable
(field_expression field: (identifier) @property)
(var_instruction variable: (expression) @variable)

(stub_call_signature function: (expression) @function)
(stub_parameter value: (expression) @variable.parameter)
