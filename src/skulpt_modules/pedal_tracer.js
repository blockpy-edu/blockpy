export const $pedal_tracer = `

"""
Wraps the tracer module in Pedal
"""

import os
import utility
        
class SandboxBasicTracer:
    """

    """
    def __init__(self):
        super().__init__()
        self.filename = "student.py"
        self.code = None

    def as_filename(self, filename, code):
        if os.path.isabs(filename):
            self.filename = filename
        else:
            self.filename = os.path.abspath(filename)
        self.code = code
        return self

    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc_val, traceback):
        pass

class SandboxNativeTracer(SandboxBasicTracer):
    """
    Tracks lines covered and function calls. Possibly other things? We could track variables, if that
    was something people wanted.

    TODO: Handle multiple submission files?
    """
    def __init__(self):
        super().__init__()
        #self.calls = utility.trace_calls()
        self.lines = utility.trace_lines()
        self.step_index = len(utility.trace_lines())
    
    def get_calls(self):
        return utility.trace_calls()
    
    calls = property(get_calls)
    
    def __enter__(self):
        utility.start_trace(self)

    def __exit__(self, exc_type, exc_val, traceback):
        utility.stop_trace(self)

TRACER_STYLES = {
    'none': SandboxBasicTracer,
    'native': SandboxNativeTracer
}

`;