

# Blockpy Server 

Flask-based server for managing the BlockPy LTI app.


To run the server, you'll want to start by initizalizing the database:

    python manage.py reset_db
    
And you can install some test data too.

    python manage.py populate_db
    
Apparently this creates an admin user named "Austin Cory Bart", so that's gotta be fixed. Sigh. But, you can always visualize the database schema if you have graphviz installed.

    python manage.py display_db
    
Anyway, you can start the server with a local secure connection with the following:

    python manage.py secure
    
Now you can open your browser and navigate to "https://localhost:5000" and start interacting with the environment.

If you don't want to deal with SSL stuff, you can also start using it without setting up a secure local connection:

    python manage.py runserver

Installing on a Server
======================

You might also want to run this on a server. To do so, just create a new main WSGI file and import the application as you normally would. Need to expand this with an example.

Also need to give instructions for setting up SSL to handle LTI stuff. It's a whole deal. 
