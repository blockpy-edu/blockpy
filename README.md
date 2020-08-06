corgis-blockly
==============

![CORGIS BlockPy](images/blockly-corgi-logo.png?raw=true "CORGIS BlockPy")

BlockPy is a web-based Python environment that lets you work with blocks, text, or both. Designed for Data Science and equipped with powerful tools like the State Explorer and Guided Feedback, the goal of BlockPy is to let you solve authentic, real-world problems.

The goal of BlockPy is to give you a gentle introduction to Python but eventually mature you into a more serious programming environment (such as Spyder or PyCharm). Long-term, we may support some game/animation design stuff that Scratch/Snap does, but that's not the real goal.

The BlockPy project is aimed at solving some hard technical problems: having a block-based environment for a dynamic language can be tricky - are a given pair of square brackets representing list indexing or dictionary indexing? Our goal is to use advanced program analysis techniques to provide excellent support to learners.

Overview
--------

The core architecture of BlockPy is a synthesis of:

* Blockly: a visual library for manipulating a block canvas that can generate equivalent textual code in a variety of languages
* Skulpt: an in-browser Python-to-JavaScript compiler/intepreter, that aims to emulate the full language with precision if not speed.

By combining these two technologies, we end up with a powerful system for writing Python code quickly. Everything is meant to run locally in the client, so there's no complexity of sandboxing students' code on the server.

Installation
------------

Briefly, you will need to do the following:

```
$> npm install
$> npm run dev
```

That should rebuild the files into `dist`. You can then open `tests/index.html` and explore.

You'll need to make sure that our fork of Skulpt, BlockMirror, Pedal library, and Pedal extensions are all appropriately adjacent as needed.