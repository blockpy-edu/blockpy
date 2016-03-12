import weather


def on_run(code, output, properties):
    f = weather.get_temperature("Miami, FL")
    c = (f - 32) / 1.8
    if not output:
        return "You have to print the temperature in Farenheit and Celsius."
    elif "weather.get_temperature(\"Miami, FL\")" not in code:
        return "You need to request Miami's current temperature."
    elif "celsius = (fahrenheit - 32) / 1.8" not in code:
        return "You are not converting the temperature to celsius using the right formula."
    elif (str(f)+"\n" in output) or (str(c)+"\n" in output):
        return True
    else:
        return "You must print Miami's temperature in both scales."
