/**
 * @fileoverview CORGIS Skulpt Book library for returning realistic, interesting data about Books.
 * @author acbart@vt.edu (Austin Cory Bart)
 */

var $builtinmodule = function(name)
{
    var mod = {};
    
    var BOOKS = [
        {'title': 'Harry Potter #1', 'author': "J. K. Rowling", 
        "price": 7.48, "paperback": true, "page count": 320},
        {'title': 'Computational Thinking', 'author': "Dennis Kafura", 
        "price": 0.00, "paperback": false, "page count": 175},
        {'title': 'Count of Monte Cristo', 'author': "Alexander Dumas", 
        "price": 8.75, "paperback": true, "page count": 1276},
        {'title': 'Anatomy & Physiology', 'author': "Michael Akins", 
        "price": 90.99, "paperback": false, "page count": 680},
        {'title': "Ender's Game", 'author': "Orson Scott Card", 
        "price": 5.99, "paperback": true, "page count": 251},
        {'title': "Chemistry 101", 'author': "Adam DeVoe", 
        "price": 69.99, "paperback": false, "page count": 570},
        {'title': "1984", 'author': "George Orwell", 
        "price": 12.25, "paperback": true, "page count": 328},
        {'title': "The Lord of the Rings", 'author': "J. R. R. Tolkien", 
        "price": 11.79, "paperback": true, "page count": 1216}
    ];

    mod.get_all = new Sk.builtin.func(function(state) {
        Sk.builtin.pyCheckArgs("get_all", arguments, 0, 0);
        return Sk.ffi.remapToPy(BOOKS);
    });

    return mod;
};