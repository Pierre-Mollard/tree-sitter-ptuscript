(var_instruction) @indent

; Main blocks
(element_block) @indent
(service_block) @indent
(test_block) @indent

; Code blocks
(define_stub_block) @indent
(environment_block) @indent
(init_block) @indent
(termination_block) @indent

; Conditional blocks
(ifelse_block) @indent
(simul_block) @indent

; Ends of blocks
"END" @dedent
"ELSE" @dedent
"ELSE_SIMUL" @dedent

((element_block) @indent)

;; TODO: not working
