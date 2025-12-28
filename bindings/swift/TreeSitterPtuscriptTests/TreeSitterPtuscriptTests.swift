import XCTest
import SwiftTreeSitter
import TreeSitterPtuscript

final class TreeSitterPtuscriptTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_ptuscript())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading PTUScript grammar")
    }
}
