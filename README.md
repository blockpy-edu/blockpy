corgis-blockly
==============

Synthesizing Blockly, Python Tutor, and Google Drive

Commands
--------

Push changes to the subtrees' repos: 

    > git subtree push --prefix=skulpt/ --squash skulpt master
    > git subtree push --prefix=blockly/ --squash blockly master
    > git subtree push --prefix=server/ --squash server master
    
Pull changes from upstream repos:

    > git subtree pull --prefix=skulpt --squash skulpt_upstream master
    > git subtree pull --prefix=blockly --squash blockly_upstream master


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
        
Silicon.inject(