; ----------------------------------------------------------------------------
; PTU BLOCK HEADERS -> PURPLE/MAUVE
; (Distinct from C functions which are usually Blue)
; ----------------------------------------------------------------------------
"SERVICE"           @keyword.exception   ; Purple/Mauve
"TEST"              @keyword.exception
"ELEMENT"           @keyword.exception
"INITIALIZATION"    @keyword.exception
"TERMINATION"       @keyword.exception
"ENVIRONMENT"       @keyword.conditional.ternary
(environment_block name: (identifier) @string.documentation)
(environment_block parameter: (identifier) @string.documentation)
"FAMILY"            @keyword.conditional.ternary
(family_instruction family_name: (identifier) @string.documentation)

; The names of these blocks -> BOLD PEACH/ORANGE
(service_block service_name: (identifier) @constant.builtin)
(test_block    test_name: (identifier) @constant.builtin)

; ----------------------------------------------------------------------------
; DATA DECLARATIONS -> TEAL/CYAN
; (Distinct from C types 'int/char' which are Yellow/Blue)
; ----------------------------------------------------------------------------
"VAR"               @keyword.import      ; Teal
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

; ----------------------------------------------------------------------------
; TEST PARAMETERS -> YELLOW/GOLD
; (init, ev, min, max should pop out as 'keys')
; ----------------------------------------------------------------------------
;"init"              @field               ; Usually Blue or Lavender
;"ev"                @field
;"min"               @field
;"max"               @field

; ----------------------------------------------------------------------------
; META / STUBS -> BRIGHT RED/MAROON
; ----------------------------------------------------------------------------
"DEFINE"            @keyword.debug       ; Red/Orange
"STUB"              @keyword.debug
"HEADER"            @preproc             ; Pink/Rose

; ----------------------------------------------------------------------------
; PTU CONTROL FLOW -> ITALIC ORANGE
; (Different from C 'if/else' which are Mauve/Purple)
; ----------------------------------------------------------------------------
"IF"                @keyword.coroutine   ; Often Orange/Peach in themes
"ELSE"              @keyword.coroutine
"END"               @keyword.coroutine
"SIMUL"             @keyword.coroutine
"ELSE_SIMUL"        @keyword.coroutine
"NEXT_TEST"         @keyword.coroutine

; ----------------------------------------------------------------------------
; COMMENTS
; ----------------------------------------------------------------------------
"COMMENT"                   @comment     ; Standard grey
(comment_instruction)       @comment     ; Standard grey
(other_comment_instruction) @comment     ; Standard grey


; STUB

(mode_in) @type.qualifier     ; e.g., "const" color
(mode_out) @type.qualifier
(mode_inout) @type.qualifier
(mode_no) @type.qualifier

(identifier) @variable
(string) @string
(number) @number
