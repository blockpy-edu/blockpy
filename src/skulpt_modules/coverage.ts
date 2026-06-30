export const $sk_mod_coverage = `
"""
Hideous fill-in replacement for Coverage, leveraging some magic from the
Utility function. The data this returns is false - it doesn't actually
describe the missing lines and all lines; it just describes the traced lines.
But since Pedal doesn't need the other two, it works out fine when you do:

statements - missing
"""

import utility

class Coverage:
    def start(self):
        pass

    def stop(self):
        pass

    def save(self):
        pass

    def _analyze(self, filename: str):
        lines = set(utility.trace_lines())
        # lines will be the lines that were actually executed
        return Analysis(None, len(lines), None, set(), lines)


class Numbers:
    def __init__(self, n_missing, n_statements, pc_covered):
        self.n_missing = n_missing
        self.n_statements = n_statements
        self.pc_covered = pc_covered


class Analysis:
    def __init__(self, n_missing, n_statements, pc_covered, missing, statements):
        self.missing = missing
        self.statements = statements
        self.numbers = Numbers(n_missing, n_statements, pc_covered)


class python:
    def get_python_source(self):
        return None
`;