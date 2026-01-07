; "Start indenting AFTER this node's start"
[ 
  (element_block)
  (service_block)
  (test_block)
  (define_stub_block)
  (environment_block)
  (init_block)
  (termination_block)
  (ifelse_block)
  (simul_block)
] @indent.begin

; dedent ME, but keep children indented" 
[
"ELSE"
"ELSE_SIMUL"
] @indent.branch

; dedent ME and everything after"
[
  "END"
] @indent.dedent

(native_code) @indent.auto

(other_comment_instruction) @indent.auto
(comment_instruction) @indent.auto
