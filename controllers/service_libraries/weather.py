from __future__ import print_function

_USE_CLASSES = False
_START_CONNECTED = True

import sys, zlib, base64
try:
    import simplejson as json
except ImportError:
    import json

HEADER = {'User-Agent': 'CORGIS Weather library for educational purposes'}
PYTHON_3 = sys.version_info >= (3, 0)

if PYTHON_3:
    from urllib.error import HTTPError
    import urllib.request as request
    from urllib.parse import quote_plus
else:
    from urllib2 import HTTPError
    import urllib2
    from urllib import quote_plus

################################################################################
# Auxilary
################################################################################

def _parse_int(value, default=0):
    """
    Attempt to cast *value* into an integer, returning *default* if it fails.
    """
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default

def _parse_float(value, default=0.0):
    """
    Attempt to cast *value* into a float, returning *default* if it fails.
    """
    if value is None:
        return default
    try:
        return float(value)
    except ValueError:
        return default

def _parse_boolean(value, default=False):
    """
    Attempt to cast *value* into a bool, returning *default* if it fails.
    """
    if value is None:
        return default
    try:
        return bool(value)
    except ValueError:
        return default

def _iteritems(_dict):
    """
    Internal method to factor-out Py2-to-3 differences in dictionary item
        iterator methods

    :param dict _dict: the dictionary to parse
    :returns: the iterable dictionary
    """
    if PYTHON_3:
        return _dict.items()
    else:
        return _dict.iteritems()


def _urlencode(query, params):
    """
    Internal method to combine the url and params into a single url string.

    :param str query: the base url to query
    :param dict params: the parameters to send to the url
    :returns: a *str* of the full url
    """
    return query + '?' + '&'.join(key+'='+quote_plus(str(value))
                                  for key, value in _iteritems(params))


def _get(url):
    """
    Internal method to convert a URL into it's response (a *str*).

    :param str url: the url to request a response from
    :returns: the *str* response
    """
    if PYTHON_3:
        req = request.Request(url, headers=HEADER)
        response = request.urlopen(req)
        return response.read().decode('utf-8')
    else:
        req = urllib2.Request(url, headers=HEADER)
        response = urllib2.urlopen(req)
        return response.read()


def _recursively_convert_unicode_to_str(input):
    """
    Force the given input to only use `str` instead of `bytes` or `unicode`.

    This works even if the input is a dict, list,
    """
    if isinstance(input, dict):
        return {_recursively_convert_unicode_to_str(key): _recursively_convert_unicode_to_str(value) for key, value in input.items()}
    elif isinstance(input, list):
        return [_recursively_convert_unicode_to_str(element) for element in input]
    elif PYTHON_3 and isinstance(input, str):
        return str(input.encode('ascii', 'replace').decode('ascii'))
    else:
        return input
        
def _from_json(data):
    """
    Convert the given string data into a JSON dict/list/primitive, ensuring that
    `str` are used instead of bytes.
    """
    return _recursively_convert_unicode_to_str(json.loads(data))
        
################################################################################
# Cache
################################################################################

_CACHE = {}
_CACHE_COUNTER = {}
_EDITABLE = False
_CONNECTED = True
_PATTERN = "repeat"


def _start_editing(pattern="repeat"):
    """
    Start adding seen entries to the cache. So, every time that you make a request,
    it will be saved to the cache. You must :ref:`_save_cache` to save the
    newly edited cache to disk, though!
    """
    global _EDITABLE, _PATTERN
    _EDITABLE = True
    _PATTERN = pattern


def _stop_editing():
    """
    Stop adding seen entries to the cache.
    """
    global _EDITABLE
    _EDITABLE = False


def _add_to_cache(key, value):
    """
    Internal method to add a new key-value to the local cache.
    :param str key: The new url to add to the cache
    :param str value: The HTTP response for this key.
    :returns: void
    """
    if key in _CACHE:
        _CACHE[key].append(value)
    else:
        _CACHE[key] = [_PATTERN, value]
        _CACHE_COUNTER[key] = 0


def _clear_key(key):
    """
    Internal method to remove a key from the local cache.
    :param str key: The url to remove from the cache
    """
    if key in _CACHE:
        del _CACHE[key]


def _save_cache(filename="cache.json"):
    """
    Internal method to save the cache in memory to a file, so that it can be used later.

    :param str filename: the location to store this at.
    """
    with open(filename, 'w') as f:
        json.dump({"data": _CACHE, "metadata": ""}, f)


def _lookup(key):
    """
    Internal method that looks up a key in the local cache.

    :param key: Get the value based on the key from the cache.
    :type key: string
    :returns: void
    """
    if key not in _CACHE:
        return ""
    if _CACHE_COUNTER[key] >= len(_CACHE[key][1:]):
        if _CACHE[key][0] == "empty":
            return ""
        elif _CACHE[key][0] == "repeat" and _CACHE[key][1:]:
            return _CACHE[key][-1]
        elif _CACHE[key][0] == "repeat":
            return ""
        else:
            _CACHE_COUNTER[key] = 1
    else:
        _CACHE_COUNTER[key] += 1
    if _CACHE[key]:
        return _CACHE[key][_CACHE_COUNTER[key]]
    else:
        return ""


def connect():
    """
    Connect to the online data source in order to get up-to-date information.

    :returns: void
    """
    global _CONNECTED
    _CONNECTED = True

def _load_from_string(data):
    '''Loads the cache from the string'''
    global _CACHE
    if PYTHON_3:
        data = json.loads(data.decode("utf-8"))
    else:
        data = json.loads(data)
    _CACHE = _recursively_convert_unicode_to_str(data)['data']

def disconnect(filename=None):
    """
    Connect to the local cache, so no internet connection is required.

    :returns: void
    """
    global _CONNECTED, _CACHE
    if filename is not None:
        try:
            with open(filename, 'r') as f:
                _load_from_string(f.read())
        except (OSError, IOError) as e:
            raise WeatherException("The cache file '{}' was not found, and I cannot disconnect without one.".format(filename))
    for key in _CACHE.keys():
        _CACHE_COUNTER[key] = 0
    _CONNECTED = False
        
################################################################################
# Domain Objects
################################################################################
        
class Location(object):
    """
    A detailed description of a location
    """
    def __init__(self, latitude, longitude, elevation, name):
        """
        Creates a new Location
        
        :param self: This object
        :type self: Location
        :param latitude: The latitude (up-down) of this location.
        :type latitude: float
        :param longitude: The longitude (left-right) of this location.
        :type longitude: float
        :param elevation: The height above sea-level (in feet).
        :type elevation: int
        :param name: The city and state that this location is in.
        :type name: string
        :returns: Location
        """
        self.latitude = latitude
        self.longitude = longitude
        self.elevation = elevation
        self.name = name
        
    def __unicode__(self):
        return "<Location: {}>".format(self.name)

    def __repr__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def __str__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def _to_dict(self):
        return {'latitude': self.latitude, 'longitude': self.longitude,  
                'elevation': self.elevation,
                'name': self.name}

    
    @staticmethod
    def _from_json(json_data):
        """
        Creates a Location from json data.
        
        :param json_data: The raw json data to parse
        :type json_data: dict
        :returns: Location
        """
        return Location(_parse_float(json_data.get('latitude', 0.0)),
                        _parse_float(json_data.get('longitude', 0.0)),
                        _parse_int(json_data.get('elevation', 0)),
                        json_data.get('areaDescription', ''))

class Weather(object):
    """
    A structured representation the current weather.
    """
    def __init__(self, temp, dewpoint, humidity, wind_speed, wind_direction, description, image_url, visibility, windchill, pressure):
        """
        Creates a new Weather
        
        :param self: This object
        :type self: Weather
        :param temp: The current temperature (in Fahrenheit).
        :type temp: int
        :param dewpoint: The current dewpoint temperature (in Fahrenheit).
        :type dewpoint: int
        :param humidity: The current relative humidity (as a percentage).
        :type humidity: int
        :param wind_speed: The current wind speed (in miles-per-hour).
        :type wind_speed: int
        :param wind_direction: The current wind direction (in degrees).
        :type wind_direction: int
        :param description: A human-readable description of the current weather.
        :type description: string
        :param image_url: A url pointing to a picture that describes the weather.
        :type image_url: string
        :param visibility: How far you can see (in miles).
        :type visibility: float
        :param windchill: The perceived temperature (in Fahrenheit).
        :type windchill: int
        :param pressure: The barometric pressure (in inches).
        :type pressure: float
        :returns: Weather
        """
        self.temp = temp
        self.dewpoint = dewpoint
        self.humidity = humidity
        self.wind_speed = wind_speed
        self.wind_direction = wind_direction
        self.description = description
        self.image_url = image_url
        self.visibility = visibility
        self.windchill = windchill
        self.pressure = pressure
        
    def __unicode__(self):
        return "<Weather: {}F and {}>".format(self.temperature, self.description)

    def __repr__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def __str__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def _to_dict(self):
        return {'temperature': self.temp,
                'dewpoint': self.dewpoint,
                'humidity': self.humidity,
                'wind_speed': self.wind_speed,
                'wind_direction': self.wind_direction,
                'description': self.description,
                'image_url': self.image_url,
                'visibility': self.visibility,
                'windchill': self.windchill,
                'pressure': self.pressure}
    
    @staticmethod
    def _from_json(json_data):
        """
        Creates a Weather from json data.
        
        :param json_data: The raw json data to parse
        :type json_data: dict
        :returns: Weather
        """
        return Weather(_parse_int(json_data.get('Temp', 0)),
                       _parse_int(json_data.get('Dewp', 0)),
                       _parse_int(json_data.get('Relh', 0)),
                       _parse_int(json_data.get('Winds', 0)),
                       _parse_int(json_data.get('Windd', 0)),
                       json_data.get('Weather', ''),
                       json_data.get('Weatherimage', ''),
                       _parse_float(json_data.get('Visibility', 0.0)),
                       _parse_int(json_data.get('WindChill', 0)),
                       _parse_float(json_data.get('SLP', 0.0)))

class Forecast(object):
    """
    A prediction for future weather.
    """
    def __init__(self, period_name, period_time, temperature_label, temperature, probability_of_precipitation, description, image_url, long_description):
        """
        Creates a new Forecast
        
        :param self: This object
        :type self: Forecast
        :param period_name: A human-readable name for this time period (e.g. Tonight or Saturday).
        :type period_name: string
        :param period_time: A string representing the time that this period starts. Encoded as YYYY-MM-DDTHH:MM:SS, where the T is not a number, but a always present character (e.g. 2013-07-30T18:00:00).
        :type period_time: string
        :param temperature_label: Either 'High' or 'Low', depending on whether or not the predicted temperature is a daily high or a daily low.
        :type temperature_label: string
        :param temperature: The predicted temperature for this period (in Fahrenheit).
        :type temperature: int
        :param probability_of_precipitation: The probability of precipitation for this period (as a percentage).
        :type probability_of_precipitation: int
        :param description: A human-readable description of the predicted weather for this period.
        :type description: string
        :param image_url: A url pointing to a picture that describes the predicted weather for this period.
        :type image_url: string
        :param long_description: A more-detailed, human-readable description of the predicted weather for this period.
        :type long_description: string
        :returns: Forecast
        """
        self.period_name = period_name
        self.period_time = period_time
        self.temperature_label = temperature_label
        self.temperature = temperature
        if probability_of_precipitation is None:
            self.probability_of_precipitation = 0
        else:
            self.probability_of_precipitation = probability_of_precipitation
        self.description = description
        self.image_url = image_url
        self.long_description = long_description
        
    def __unicode__(self):
        return "<Forecast: {}>".format(self.period_name)

    def __repr__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def __str__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def _to_dict(self):
        return {'period_name': self.period_name,
                'period_time': self.period_time,
                'temperature_label': self.temperature_label,
                'temperature': self.temperature,
                'probability_of_precipitation': self.probability_of_precipitation,
                'description': self.description,
                'image_url': self.image_url,
                'long_description': self.long_description}
    
    @staticmethod
    def _from_json(json_data):
        """
        Creates a Forecast from json data.
        
        :param json_data: The raw json data to parse
        :type json_data: dict
        :returns: Forecast
        """
        return map(Forecast, json_data['time']['startPeriodName'],
                    json_data['time']['startValidTime'],
                    json_data['time']['tempLabel'],
                    map(_parse_int, json_data['data']['temperature']),
                    map(_parse_int, json_data['data']['pop']),
                    json_data['data']['weather'],
                    json_data['data']['iconLink'],
                    json_data['data']['text'])

class Report(object):
    """
    A container for the weather, forecasts, and location information.
    """
    def __init__(self, weather, forecasts, location):
        """
        Creates a new Report
        
        :param self: This object
        :type self: Report
        :param weather: The current weather for this location.
        :type weather: Weather
        :param forecasts: The forecast for the next 7 days and 7 nights.
        :type forecasts: listof Forecast
        :param location: More detailed information on this location.
        :type location: Location
        :returns: Report
        """
        self.weather = weather
        self.forecasts = forecasts
        self.location = location
        
    def __unicode__(self):
        return "<Report: {}>".format(self.location)

    def __repr__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def __str__(self):
        string = self.__unicode__()

        if not PYTHON_3:
            return string.encode('utf-8')

        return string

    def _to_dict(self):
        return {'weather': self.weather._to_dict(),
                'forecasts': map(Forecast._to_dict, self.forecasts),
                'location': self.location._to_dict()}
    
    @staticmethod
    def _from_json(json_data):
        """
        Creates a Report from json data.
        
        :param json_data: The raw json data to parse
        :type json_data: dict
        :returns: Report
        """
        return Report(Weather._from_json(json_data['currentobservation']),
                    Forecast._from_json(json_data),
                    Location._from_json(json_data['location']))
                    
################################################################################
# Exceptions
################################################################################
class GeocodeException(Exception):
    pass
class WeatherException(Exception):
    pass

GEOCODE_ERRORS = {"REQUEST_DENIED": "The given address was denied.",
				  "ZERO_RESULTS": "The given address could not be found.",
				  "OVER_QUERY_LIMIT": "The service has been used too many times today.",
				  "INVALID_REQUEST": "The given address was invalid.",
				  "UNKNOWN_ERROR": "A temporary error occurred; please try again.",
				  "UNAVAILABLE": "The given address is not available offline."}
################################################################################
# Service call
################################################################################

def _get_report_request(latitude,longitude):
    """
    Used to build the request string used by :func:`get_report`.
    
    
    :param latitude: The latitude (up-down) of the location to get information about.
    :type latitude: float
    
    :param longitude: The longitude (left-right) of the location to get information about.
    :type longitude: float
    :returns: str
    """
    arguments = dict([("lat", latitude), ("FcstType", "json"), ("lon", longitude)])
    return _urlencode("http://forecast.weather.gov/MapClick.php", arguments)

def _get_report_string(latitude,longitude):
    """
    Like :func:`get_report` except returns the raw data instead.
    
    
    :param latitude: The latitude (up-down) of the location to get information about.
    :type latitude: float
    
    :param longitude: The longitude (left-right) of the location to get information about.
    :type longitude: float
    :returns: str
    """
    key = _get_report_request(latitude, longitude)
    result = _get(key) if _CONNECTED else _lookup(key)
    if _CONNECTED and _EDITABLE:
        _add_to_cache(key, result)
    return result

def get_report_by_latlng(latitude,longitude):
    """
    Gets a report on the current weather, forecast, and more detailed information about the location.
    
    
    :param latitude: The latitude (up-down) of the location to get information about.
    :type latitude: float
    
    :param longitude: The longitude (left-right) of the location to get information about.
    :type longitude: float
    :returns: Report
    """
    result = _get_report_string(latitude,longitude)
    if result:
        try:
            json_result = _from_json(result)
        except ValueError:
            raise WeatherException("This city was outside of the continental United States.")
        if _USE_CLASSES:
            return Report._from_json(json_result)
        else:
            return Report._from_json(json_result)._to_dict()
    else:
        if _CONNECTED:
            raise WeatherException("No response from the server.")
        else:
            raise WeatherException("No data was in the cache for this location.")
    
def _geocode_request(address):
    """
    Used to build the request string used by :func:`geocode`.
    
    :param str address: A location (e.g., "Newark, DE") somewhere in the United States
    :returns: str
    """
    address = address.lower()
    arguments = dict([("address", address), ("sensor", "true")])
    return _urlencode("http://maps.googleapis.com/maps/api/geocode/json", arguments)
    
def _geocode(address):
    """
    Like :func:`geocode` except returns the raw data instead.
    
    :param str address: A location (e.g., "Newark, DE") somewhere in the United States
    :returns: str
    """
    key = _geocode_request(address)
    result = _get(key) if _CONNECTED else _lookup(key)
    if _CONNECTED and _EDITABLE:
        _add_to_cache(key, result)
    return result

def get_report(address):
    """
    Gets a report on the current weather, forecast, and more detailed information about the location.
    
    :param str address: A location (e.g., "Newark, DE") somewhere in the United States
    :returns: report
    """
    response = _geocode(address)
    if response == "":
        if _CONNECTED:
            raise GeocodeException("Nothing was returned from the server.")
        else:
            raise GeocodeException("The given city was not in the cache.")
    try:
        geocode_data = _from_json(response)
    except ValueError:
        raise GeocodeException("The response from the Server was invalid. Perhaps the internet is down?")
    status = geocode_data.get('status', 'INVALID_RETURN')
    if status == 'OK':
        try:
            results = geocode_data['results']
            if results:
                location = results[0]['geometry']['location']
                latitude = location['lat']
                longitude = location['lng']
            else:
                raise GeocodeException("The address could not be found; check that it's valid on Google Maps.")
        except KeyError:
            raise GeocodeException("The response from the Geocode server was invalid. Perhaps this wasn't a valid address?")
        return get_report_by_latlng(latitude, longitude)
    else:
        raise GeocodeException(GEOCODE_ERRORS.get(status, "Unknown error occurred: "+status))
        
def get_temperature(address):
    """
    Gets the current temperature

    :param str address: A location (e.g., "Newark, DE") somewhere in the
    United States
    :return: an int temperature
    """
    report = get_report(address)
    if _USE_CLASSES:
        return report.weather.temp
    else:
        return report['weather']['temperature']


def get_forecasts(address):
    """
    Gets the high temperatures for the time period

    :param str address: A location (e.g., "Newark, DE") somewhere in the
    United States
    :return list: a list of ints
    """

    report = get_report(address)
    if _USE_CLASSES:
        templist = [f.temperature for f in report.forecasts]
    else:
        templist = [f['temperature'] for f in report['forecasts']]
    highslist = templist[::2]
    return highslist

_load_from_string(zlib.decompress(base64.b64decode(
	'''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'''
	'''PP/A6N/3us='''
)))