; Inject C into lines starting with # or @
(native_code
    (c_code) @injection.content)
    (#set! injection.language "c")

(native_code
  content: (_) @injection.content)
  (#set! injection.language "c")
