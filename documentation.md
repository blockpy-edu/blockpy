This is an attempt to summarize key parts of BlockPy's execution model. Expect most of it to be out of date by the time I'm done writing, but it's at least true here and now, May 2nd 2023!

# Big Ideas

BlockPy is composed of components. Most interesting stuff is in one of the components, accessible via the `blockpy` instance (usually `this.main` internally) in its `.components` field.

The UI is KnockoutJS, so you have a bunch of HTML templates littered around the codebase, with various `data-bind` attributes connecting to the actual UI logic (which unfortunately just gets stuffed in `blockpy.js`.

# Execution Pipeline

The interface is done via KnockoutJS. That was a mistake but here we are. The UI is broken off into separate components, one of which is the list of possible `Editor` instances. The most critical one is the Python Editor (`editor/python.js`). You bind the `click` event handler to `ui.execute.run`:

https://github.com/blockpy-edu/blockpy/blob/1e3c26ff6ce37e8c1865b1b3898b861a11db1201/src/editor/python.js#L35-L41

That function is stuffed into the big main `blockpy.js` file, because apparently Past Me chose to forget everything he knew about modular design:

https://github.com/blockpy-edu/blockpy/blob/1e3c26ff6ce37e8c1865b1b3898b861a11db1201/src/blockpy.js#L1019-L1027

That is really just dispatching to `delayedRun` (there are performance reasons for this, believe it or not), which in turn is responsible for calling `run` (there are not performance reasons for that, it's just leftover structure from an older hack):

https://github.com/blockpy-edu/blockpy/blob/master/src/engine.js#L98-L124

Okay the actual `run` function finally gets a little interesting. This is in `engine.js` and requires you to understand the `Configuration` hierarchy that we use.

![image](https://user-images.githubusercontent.com/897227/235737132-08fa2911-1ccb-4ea4-87ba-f9af884cb5b4.png)

We need to be able to run the user's code in various ways. The different `Configuration` classes allow us to reuse functionality between those "various ways". In addition to the methods shown, they also have a bunch of methods like `print()`, `input()`, `openFile()`, etc. that work differently depending on how the code is meant to be executed (e.g., the `Student` variant's `print` puts text on the BlockPy console, the `Instructor` variant's `print` puts it in the developer console).

Anyway, the critical thing is that if you are calling the `run` function in the `BlockPyEngine` component, then it going to set the current `configuration` for the engine, and then delegate out to the general `execute` function:

https://github.com/blockpy-edu/blockpy/blob/1e3c26ff6ce37e8c1865b1b3898b861a11db1201/src/engine.js#L172-L179

That is where the actual `Skulpt` magic happens, calling `Sk.importMainWithBody` with the appropriate data and returning a promise for when it is finished. After all is done, we call the relevant `Configuration.success` and `Configuration.failure` callbacks and eventually the `Configuration.finally` handlers. Assuming we we have not disabled feedback, *then* we repeat this process for the `onRun`.

https://github.com/blockpy-edu/blockpy/blob/master/src/engine.js#L126-L134

Basically the same process as before, just a little simpler. We are now running the instructor control script: the contents of the assignment's `on_run.py` file wrapped with our template that does all the boilerplate stuff for executing Pedal:

https://github.com/blockpy-edu/blockpy/blob/master/src/engine/on_run.js#L17-L98

Once that's all done, we post-process the results in various ways, including calling `this.main.components.feedback.presentFeedback(results)`, updating the submission's data locally and on the backend, and so on:

https://github.com/blockpy-edu/blockpy/blob/1e3c26ff6ce37e8c1865b1b3898b861a11db1201/src/engine/on_run.js#L141-L176

Actually intepretting the feedback is a fairly tedious process, but the `Feedback` component is fairly self-contained. If you poke around the `src/feedback.js` file, you'll find its HTML template and the various logic for controlling it.

https://github.com/blockpy-edu/blockpy/blob/f9efb382b103410cdea3e9eb806ef27cd9e6039b/src/feedback.js#L240-L255

There's so much I know more now about interfacing more directly with the Skulpt data, but the code mostly works.

God, I wish I could just sit down and rewrite all of this from scratch, using TypeScript, a better UI library, and some sane decisions in terms of modular separation of concerns. I'm this guy:

![image](https://user-images.githubusercontent.com/897227/235740346-d950276a-6a9c-4940-a4b6-720d17da0861.png)
