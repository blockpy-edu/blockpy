import parking

print("Constant", parking.Day('Tuesday'))
print("Today default", parking.today())

print("Today is Wed (true)", parking.day_compare('IS', parking.today(), "wed"))
print("Today is Tue (false)", parking.day_compare('IS', parking.today(), "tue"))
print("Tue is Tue (true)", parking.day_compare('IS', parking.Day('Tuesday'), "tue"))
print("Tue is Wed (false)", parking.day_compare('IS', parking.Day('Tuesday'), "Wed"))

parking._today = 'sun'
print("Today fake", parking.today())

#print(parking.compare('equal', 5, 5))