import comp_think.crime as crime
import matplotlib.pyplot as plt

all_the_crime = crime.get_all()
out_crime = []
out_count = {}

for a_crime in all_the_crime:
    if X:
        out_crime.append(a_crime['weather'])
out_count['weather'] += 1
plt.plot(out_crime)
print(out_crime)