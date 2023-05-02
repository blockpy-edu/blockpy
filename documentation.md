This is an attempt to summarize key parts of BlockPy's execution model. Expect most of it to be out of date by the time I'm done writing, but it's at least true here and now, May 2nd 2023!

# Execution Pipeline

The interface is done via KnockoutJS. That was a mistake but here we are. It's at least not hard to see where how it binds the Run button:

[src/editor/python.js#L37](src/editor/python.js#L37)
