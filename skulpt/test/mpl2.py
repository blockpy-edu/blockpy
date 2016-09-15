import matplotlib.pyplot as plt
import random

def freq(values):
    counts = {}
    for v in values:
      if v in counts:
        counts[v] += 1
      else:
        counts[v] = 1
    return counts

values = range(100, 200, 10)
plt.hist(values, bins=5)
plt.show()
print(len(set(values)))
print(freq(values))

values = [random.randint(0, 9) for x in range(1000)]
plt.hist(values)
plt.show()
print(len(set(values)))
print(freq(values))


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
