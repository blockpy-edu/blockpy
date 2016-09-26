import matplotlib.pyplot as plt
import random


xs = [random.randint(0, 100) for x in xrange(1000)]
ys = [random.randint(0, 100) for x in xrange(1000)]

plt.scatter(xs, ys)
plt.show()


'''
plt.hist([1,1,1,3,3,5,8,8,10])
plt.show()

plt.plot([1,4,8,4,1])
plt.plot([1,2,3,4,5], 'r')
plt.plot([1,2,3,4,5], [6,5,4,3,1])
plt.xlabel("Time (Years)")
plt.ylabel("Distance (miles)")
plt.title("Change in distance over Time")
plt.show()

plt.scatter([1,2,3,4,5], [6,5,4,3,1])
plt.scatter([1,2,3,4,5], [1,2,3,4,5])
plt.show()
'''
