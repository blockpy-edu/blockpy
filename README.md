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

First, you're going to need all of our special dependencies. The final structure looks like this:

```
blockpy-edu/
  skulpt/
  blockly/
  BlockMirror/
  blockpy/
pedal-edu/
  pedal/
  curriculum-ctvt
  curriculum-sneks
```

1. So you can start by making the two top-level directories:

```shell
$> mkdir blockpy-edu
$> mkdir pedal-edu
```

2. Skulpt is probably the hardest dependency, since you will probably want to modify it.

```shell
$> cd blockpy-edu
$> git clone https://github.com/blockpy-edu/skulpt skulpt
$> cd skulpt
$> npm install
$> npm run devbuild
```

3. For many of the remainders, you actually only need the final compiled files (per [this file](https://github.com/blockpy-edu/blockpy/blob/master/tests/index.html#L51-L68)).
But if you want to install each from source, here are the github links:

```shell
$> cd blockpy-edu
$> git clone https://github.com/blockpy-edu/BlockMirror BlockMirror
$> git clone https://github.com/google/blockly blockly
$> cd ../pedal-edu
$> git clone https://github.com/pedal-edu/pedal pedal
$> git clone https://github.com/pedal-edu/curriculum-ctvt curriculum-ctvt
$> git clone https://github.com/pedal-edu/curriculum-sneks curriculum-sneks
```

4. To actually install the BlockPy client, you can do the following:

```
$> cd ../blockpy-edu
$> git clone https://github.com/blockpy-edu/blockpy blockpy
$> cd blockpy
$> npm install
$> npm run dev
```

That should rebuild the files into `dist`. You can then open `tests/index.html` and explore.
