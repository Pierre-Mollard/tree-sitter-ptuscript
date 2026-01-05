; queries/ptuscript/injections.scm

; 1. Target the alias 'c_code' directly
((c_code) @injection.content
 (#set! injection.language "c"))

; OR 2. Target the parent structure (safer if alias is hidden)
((native_code
   content: (_) @injection.content)
 (#set! injection.language "c"))
