

# Blockpy Server 

OpenDSA implementation using LTI communications

This is a basic and simple LTI Tool Provider that uses the
[ims-lti](https://github.com/instructure/ims-lti) gem.
To get this running in your development environment, check out the repo then:

    bundle install
    rackup config.ru
    
You can then visit `localhost:9292` to view the index page.

You can use the XML from the `/tool_config.xml` endpoint to configure the tool in a Tool Consumer.
