The following code prints out the current temperature.
#####
import weather


temperature = weather.get_temperature('Blacksburg, VA')
if temperature < 65:
  print('Cold')
else:
  print('Hot')
#####
def on_run(code, output, properties):
    return True