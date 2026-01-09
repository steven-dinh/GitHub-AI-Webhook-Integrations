const { add } = require('winston');
const logger = require('../utils/logger');
/**
 * Diffparser service to parse unified diffs from pull requests. 
 */
class DiffParser {
    /**
     * Parses patch for added lines. 
     * @param {*} patch 
     */
    getAddedLines(patch) {
        const lines = patch.split('\n');
        const addedLines = [];

        let newLineNumber = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Hunk header
            const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            if (hunkMatch) {
                newLineNumber = parseInt(hunkMatch[1], 10);
                continue;
            }

            // Added line
            if (line.startsWith('+') && !line.startsWith('+++')) {
                addedLines.push({
                    lineNumber: newLineNumber,
                    context: line.slice(1)
                });
                newLineNumber++;
                continue;
            }

            // Context line
            if (line.startsWith(' ')) {
                newLineNumber++;
                continue;
            }

            // Removed line ('-') → does NOT advance newLineNumber
        }

        return addedLines;
    }

    /**
     * Parses patch for removed lines. 
     * @param {*} patch 
     */
    getDeletedLines(patch) {
        const lines = patch.split('\n');
        const addedLines = [];

        let newLineNumber = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Hunk header
            const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            if (hunkMatch) {
                newLineNumber = parseInt(hunkMatch[1], 10);
                continue;
            }

            // Added line
            if (line.startsWith('-') && !line.startsWith('---')) {
                addedLines.push({
                    lineNumber: newLineNumber,
                    context: line.slice(1)
                });
                newLineNumber++;
                continue;
            }

            // Context line
            if (line.startsWith(' ')) {
                newLineNumber++;
                continue;
            }

            // Removed line ('-') → does NOT advance newLineNumber
        }

        return addedLines;


    }

    /**
     * Grabs the extension of the filename to detect language.
     * @param {*} filename 
     */
    detectLanguage(patch) {
        let line = patch.split('\n');
        let language = {};

        for (let i = 0; i < line.length; i++) {
            let currentLine = line[i];

            if (currentLine.startsWith("+++")) {
                language.name = currentLine.replace("+++", "").replace("b/", "").trim();
                let parsedName = language.name.substring(language.name.indexOf(".") + 1).trim();

                language.name = parsedName;
            }
        }

        return language;
    }

    /**
     * Checks if the file is a common test file name. 
     * @param {*} filename 
     */
    isTestFile(filename) {
        const testPatterns = [
            /\.test\./,          // calculator.test.js
            /\.spec\./,          // calculator.spec.js
            /__tests__\//,       // __tests__/calculator.js
            /_test\./,           // calculator_test.js
            /\.test$/,           // calculator.test (no extension)
            /\.spec$/,           // calculator.spec
            /test_.*\.py$/,      // test_calculator.py (Python)
            /.*_test\.py$/,      // calculator_test.py (Python)
        ];
        return testPatterns.some(pattern => pattern.test(filename));
    }
    /**
     * Checks if the current patch has functions. 
     * @param {*} addedLines 
     */
    containsNewFunctions(patch) {
        // Language.
        const language = this.detectLanguage(patch).name;

        // Functions to be added.
        const functions = [];

        // Splits patch into lines.
        let line = patch.split('\n');

        let patterns = {
            javascript: {
                // Function declarations
                declaration: /^\s*(export\s+)?(async\s+)?function\s+\w+\s*\(/,

                // Arrow functions
                arrow: /^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>/,

                // Function expressions
                expression: /^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s+)?function\s*\(/,

                // Class methods
                method: /^\s*(async\s+)?(\w+)\s*\([^)]*\)\s*{/,
            },

            python: {
                function: /^\s*(async\s+)?def\s+\w+\s*\(/,
            },

            java: {
                method: /^\s*(public|private|protected)?\s*(static)?\s*(final)?\s*[\w<>[\],\s]+\s+\w+\s*\(/,
            },

            go: {
                function: /^\s*func\s+(\(\w+\s+\*?\w+\)\s*)?\w+\s*\(/,
            },

        }

        // Scanning for keywords/syntax that create a function.
        if (language == '.js') {
            for (let i = 0; i < line.length; i++) {
            }
        }

        return functions;
    }
    /**
     * 
     * @param {*} addedLines 
     */
    containsImports(addedLines, language) {
        const patterns = {
            js: /import\s+.*from|require\s*\(/,
            ts: /import\s+.*from|require\s*\(/,
            py: /import\s+|from\s+.*import/,
            java: /import\s+/,
            go: /import\s+\(/,
            rust: /use\s+/,
            ruby: /require\s+/
        };

        const pattern = patterns[language.name];

        for (let line of addedLines) {
            console.log(line.context)
            return pattern ? pattern.test(line.context) : false;
        }

        // return pattern ? pattern.test(addedLines.context) : false;
    }

    /**
     * 
     * @returns object
     */
    analyzeChange(patch) {
        const parsed = {
            // 1. Added lines
            addedLines: this.getAddedLines(patch),

            // // 2. Deleted lines
            deletedLines: this.getDeletedLines(patch),

            // 3. File metadata
            filename: this.detectLanguage(patch),
            isTestFile: this.isTestFile(this.detectLanguage(patch)),

            // // 4. Basic patterns (TO BE IMPLEMENTED)
            // hasNewFunctions: this.containsNewFunctions(patch),
            hasImportChanges: this.containsImports(this.getAddedLines(patch), this.detectLanguage(patch)),
            // hasTestChanges: isTestFile(file.filename)
        }

        return parsed;
    }
}

module.exports = new DiffParser();