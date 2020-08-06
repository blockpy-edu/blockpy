import weather
import matplotlib.pyplot as plt

reports = weather.get_weather()
temperatures = []
t2 = []
for report in reports:
    temperatures.append(report['Data']['Temperature']['Avg Temp'])
    t2.append(report['Data']['Temperature']['Min Temp'])
plt.scatter(temperatures, t2)
plt.show()