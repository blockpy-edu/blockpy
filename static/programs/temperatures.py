Plot the forecasted temperatures of Miami in Celsius. You'll need to use the "<a href='#'>create empty list</a>" and "<a href='#'>append</a>" blocks to create a new list of Celsius temperatures from the forecasted temperatures in Blacksburg, and then plot these new temperatures against the old ones. 
#####
import weather
import matplotlib.pyplot as plt


celsius_temperatures = []
for t in weather.get_forecasts("Miami, FL"):
    celsius = (t - 32) / 1.8
    celsius_temperatures.append(celsius)
plt.plot(celsius_temperatures)
plt.title("Temperatures in Miami")
plt.show()
#####
def on_run(code, output, properties):
    return True