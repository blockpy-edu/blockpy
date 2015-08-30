Print the name of the state that had the highest violent crime rate in 1995.
#####
import matplotlib.pyplot as plt
import weather


plt.plot(weather.get_forecasts("Blacksburg, VA"))
plt.show()
#####
def on_run(code, output, properties):
    if 'crime.get_by_year' not in code:
        return "You'll need to use the 'get by year' block!"
    elif 'violent' not in code:
        return "You need to get the violent crime rate."
    elif 'state' not in code:
        return "You also need to store the state name while you iterate!"
    elif 'if' not in code:
        return "You will need some decision in your code. This is similar to the problems we did before where we found the maximum."
    elif output.strip() == 'District of Columbia':
        return true
    else:
        return 'You can do it!'