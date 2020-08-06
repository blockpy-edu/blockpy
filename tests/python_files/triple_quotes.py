"""
Created on Tue Apr  5 09:40:10 2016

This code creates a line graph that compares the violent crime rates
in Washington and Texas from 1960 to 2012, and also a map that shows
the number of violent crimes per state in 2012.

@author: Shane Aubain
         Ryan Buzzard
         Cassidy Deerin
         Tara King
         Valarie McLean
         Aaron Quartes III
"""

"""
Line graph of Washington crime rates and Texas crime rates over time
"""
import crime
import matplotlib.pyplot as plt
from matplotlib.legend_handler import HandlerLine2D

allCrime = crime.get_all()

texasCrime = allCrime["texas"]
washCrime = allCrime["washington"]

yearList = []
texCrimeList = []
washCrimeList = []

for data in texasCrime["data"]:
    yearList.append(data["year"])
    texCrimeList.append(data["rates"]["violent"]["all"])
    
for data in washCrime["data"]:
    washCrimeList.append(data["rates"]["violent"]["all"])
    
line1, = plt.plot(yearList, texCrimeList, label="Texas crime")
line2, = plt.plot(yearList, washCrimeList, label="Washington crime")
plt.title("Texas and Washington crime rates over time")
plt.xlabel("year")
plt.ylabel("crime rate")
plt.legend(handler_map={line1:HandlerLine2D(numpoints=4)}, loc=4)
plt.show()

"""
Number of violent crimes per state in 2012
"""
import US_Map

crimesPerState = [
  {'name': 'New Jersey',     'data': allCrime["new jersey"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Rhode Island',   'data': allCrime["rhode island"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Massachusetts',  'data': allCrime["massachusetts"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Connecticut',    'data': allCrime["connecticut"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Maryland',       'data': allCrime["maryland"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'New York',       'data': allCrime["new york"]["data"][47]["totals"]["violent"]["all"]},
  {'name': 'Delaware',       'data': allCrime["delaware"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Florida',        'data': allCrime["florida"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Ohio',           'data': allCrime["ohio"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Pennsylvania',   'data': allCrime["pennsylvania"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Illinois',       'data': allCrime["illinois"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'California',     'data': allCrime["california"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Hawaii',         'data': allCrime["hawaii"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Virginia',       'data': allCrime["virginia"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Michigan',       'data': allCrime["michigan"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Indiana',        'data': allCrime["indiana"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'North Carolina', 'data': allCrime["north carolina"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Georgia',        'data': allCrime["georgia"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Tennessee',      'data': allCrime["tennessee"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'New Hampshire',  'data': allCrime["new hampshire"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'South Carolina', 'data': allCrime["south carolina"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Louisiana',      'data': allCrime["louisiana"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Kentucky',       'data': allCrime["kentucky"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Wisconsin',      'data': allCrime["wisconsin"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Washington',     'data': allCrime["washington"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Alabama',        'data': allCrime["alabama"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Missouri',       'data': allCrime["missouri"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Texas',          'data': allCrime["texas"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'West Virginia',  'data': allCrime["west virginia"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Vermont',        'data': allCrime["vermont"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Minnesota',      'data': allCrime["minnesota"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Mississippi',    'data': allCrime["mississippi"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Iowa',           'data': allCrime["iowa"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Arkansas',       'data': allCrime["arkansas"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Oklahoma',       'data': allCrime["oklahoma"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Arizona',        'data': allCrime["arizona"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Colorado',       'data': allCrime["colorado"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Maine',          'data': allCrime["maine"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Oregon',         'data': allCrime["oregon"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Kansas',         'data': allCrime["kansas"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Utah',           'data': allCrime["utah"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Nebraska',       'data': allCrime["nebraska"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Nevada',         'data': allCrime["nevada"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Idaho',          'data': allCrime["idaho"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'New Mexico',     'data': allCrime["new mexico"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'South Dakota',   'data': allCrime["south dakota"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'North Dakota',   'data': allCrime["north dakota"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Montana',        'data': allCrime["montana"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Wyoming',        'data': allCrime["wyoming"]["data"][52]["totals"]["violent"]["all"]},
  {'name': 'Alaska',         'data': allCrime["alaska"]["data"][52]["totals"]["violent"]["all"]}  ]

US_Map.map_init()
US_Map.color_US_map(crimesPerState)

plt.title('Amount of Violent Crimes per State in 2012')        
plt.show()