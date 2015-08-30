require 'sinatra/reloader'
require './main'
require 'active_record'

use Rack::Static,
  :urls => ["/analyzer", "/blockly", "/converter", "/fonts", "/images", "/kennel", "/libs", "/skulpt"],
  :root => "public"

run Sinatra::Application