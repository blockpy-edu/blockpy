import weather

print "Forecasts:", weather.get_forecasts('Blacksburg, VA')
print "Temperature:", weather.get_temperature('Blacksburg, VA')

import numpy as np
a = [[1, 2], [3, 4]]
b = np.array(a, ndmin=3, dtype=float)
print "np.array(a, ndmin=3a, dtype=float)"

import numpy as np
print "Test arange"
a = np.arange(3)
print a

a = np.arange(3.0)
print a

a = np.arange(3,7)
print a

a = np.arange(3,7,2)
print a

print "Test linspace"

a = np.linspace(2.0, 3.0, 5)
print a

a = np.linspace(2.0, 3.0, 5, False)
print a

a = np.linspace(2.0, 3.0, 5, True, True)
print a

print ''
print 'np.linspace(2.0, 3.0, num=5)'
print np.linspace(2.0, 3.0, num=5, retstep=True)

print 'np.array([1,2,3])'
print np.array([1,2,3, 4])

print 'np.zeros((2,1))'
print np.zeros((2,1))

print 'np.ones((2,2,3))'
print np.ones((2,2,3))

