require 'sinatra/reloader'
require './main'
require 'active_record'

use Rack::Static,
  :urls => ["/AV", "/config", "/JSAV", "/lib"],
  :root => "public"

run Sinatra::Application