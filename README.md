corgis-blockly
==============

BlockPy is a web-based Python environment that lets you work with blocks, text, or both. Designed for Data Science and equipped with powerful tools like the State Explorer and Guided Feedback, the goal of BlockPy is to let you solve authentic, real-world problems.

The goal of BlockPy is to give you a gentle introduction to Python but eventually mature you into a more serious programming environment (such as Spyder or PyCharm). Long-term, we may support some game/animation design stuff that Scratch/Snap does, but that's not the real goal.

The BlockPy project is aimed at solving some hard technical problems: having a block-based environment for a dynamic language can be tricky - are a given pair of square brackets representing list indexing or dictionary indexing? Our goal is to use advanced program analysis techniques to provide excellent support to learners.

Installation
------------

First, clone it locally. This could take a little while.

    > git clone https://github.com/RealTimeWeb/blockpy.git
    

You'll need to build Skulpt and Blockly. Both of these depend on the Closure Compiler, so you'll need to put that in the empty `closure-library` folder. You can follow the [Blockly instructions here] (https://developers.google.com/blockly/hacking/closure) , but the gist will be:

    > wget https://github.com/google/closure-library/zipball/master -O closure.zip
    > unzip closure.zip
    
That's from memory - if anyone can submit a PR or correction for this, that'd be amazing. The crucial thing is that you want to make sure that you have a folder named `closure` and a folder named `third-party` one layer below the top folder, and that you don't have multiple `closure-library` folders. This may be much easier to do by hand.

Next, you'll need to build Blockly:

    > cd blockly
    > python build.py
    > cd ..

And then you'll build Skulpt:

    > cd skulpt
    > python skulpt.py dist
    > cd ..
    
And now you should be able to try out the example file!

    > start blockpy.html
    
The server has its own requirements.txt and uses a `python manage.py runserver`
   

Commands
--------

Push changes to the subtrees' repos: 

    > git subtree push --prefix=skulpt/ --squash skulpt master
    > git subtree push --prefix=blockly/ --squash blockly master
    > git subtree push --prefix=server/ --squash server master
    
Pull changes from upstream repos:

    > git subtree pull --prefix=skulpt --squash skulpt_upstream master
    > git subtree pull --prefix=blockly --squash blockly_upstream master
    > git subtree pull --prefix=server --squash server master
    
Note: if you get an error about a "fatal entry", make sure you don't have a trailing slash on the prefix!


Blockly
-------

Blockly is a subtree.




Skulpt
------

Skulpt is a subtree.

Overview
--------

    MAIN/
        docs/
        tests/
        blockly/                        <--- subtree
        skulpt/                         <--- subtree
        libs/
            d3/
            jquery/
        analyzer/
            ...
        converter/
            ...
        UI/
        manage.py
            runserver
            init
            rebuild blockly|skulpt|all
        
