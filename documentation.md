This is an attempt to summarize key parts of BlockPy's execution model. Expect most of it to be out of date by the time I'm done writing, but it's at least true here and now, May 2nd 2023!

# Execution Pipeline

The interface is done via KnockoutJS. That was a mistake but here we are. The UI is broken off into separate components, one of which is the list of possible `Editor` instances. The most critical one is the Python Editor (`editor/python.js`). You bind the `click` event handler to `ui.execute.run`:

https://github.com/blockpy-edu/blockpy/blob/1e3c26ff6ce37e8c1865b1b3898b861a11db1201/src/editor/python.js#L35-L41

That function is stuffed into the big main `blockpy.js` file, because apparently Past Me chose to forget everything he knew about modular design:

https://github.com/blockpy-edu/blockpy/blob/1e3c26ff6ce37e8c1865b1b3898b861a11db1201/src/blockpy.js#L1019-L1027

That is really just dispatching to `delayedRun` (there are performance reasons for this, believe it or not), which in turn is responsible for calling `run` (there are not performance reasons for that, it's just leftover structure from an older hack):

https://github.com/blockpy-edu/blockpy/blob/master/src/engine.js#L98-L134

Okay the actual `run` function finally gets a little interesting. This is in `engine.js` and requires you to understand the `Configuration` hierarchy that we use.

![image](https://user-images.githubusercontent.com/897227/235737132-08fa2911-1ccb-4ea4-87ba-f9af884cb5b4.png)

We need to be able to run the user's code in various ways. The different `Configuration` classes allow us to reuse functionality between those "various ways". In addition to the methods shown, they also have a bunch of methods like `print()`, `input()`, `openFile()`, etc. that work differently depending on how the code is meant to be executed (e.g., the `Student` variant's `print` puts text on the BlockPy console, the `Instructor` variant's `print` puts it in the developer console). Anyway, the critical thing is that if you 
