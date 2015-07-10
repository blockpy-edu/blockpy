require 'sinatra/reloader'
require './tool_provider'

use Rack::Static,
  :urls => ["/AV", "/config", "/JSAV", "/lib"],
  :root => "public"

run Sinatra::Application