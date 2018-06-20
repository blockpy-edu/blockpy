import parking

print(parking.today().__class__)
print(parking.now().__class__)

print("Today is", parking.today())
print("Now is", parking.now())

print("Testing basic Day creation")
assert parking.Day('Monday') == parking.Day('Monday'), "Monday is not equal to Monday"
assert parking.Day('Monday') != parking.Day('Tuesday'), "Monday is not equal to Tuesday"
assert parking.Day('Tuesday'), "Unable to create Day"
print("Testing today() function")
assert parking.today, "Unable to create Today"

parking._today = 'wed'
print("Testing today() function for comparisons")
assert parking.day_compare('IS', parking.today(), "wed"), "Today is wednesday"
assert not parking.day_compare('IS', parking.today(), "sat"), "Today is not saturday"
assert not parking.day_compare('IS', parking.Day('Tuesday'), "sat"), "Tuesday is saturday"
assert parking.day_compare('IS', parking.Day('Saturday'), "sat"), "Saturday is not saturday"

print("Testing comparisons for day")
assert parking.day_compare('IS', parking.today(), "wed"), "Wednesday == Wednesday"
assert not parking.day_compare('IS', parking.today(), "sun"), "Wednesday == Sunday"
assert not parking.day_compare('IS', parking.today(), "mon"), "Wednesday == Monday"
assert parking.today() == parking.Day("Wed"), "Wednesday == Wednesday"
assert not parking.today() == parking.Day("Sun"), "Wednesday == Sunday"
assert not parking.today() == parking.Day("Mon"), "Wednesday == Monday"

assert not parking.day_compare('BEFORE', parking.today(), "wed"), "Wednesday < Wednesday"
assert not parking.day_compare('BEFORE', parking.today(), "mon"), "Wednesday < Monday"
assert parking.day_compare('BEFORE', parking.today(), "saturday"), "Wednesday < Saturday"
assert not parking.today() < parking.Day("Wed"), "Wednesday < Wednesday"
assert not parking.today() < parking.Day("Monday"), "Wednesday < Monday"
assert parking.today() < parking.Day("Sat"), "Wednesday < Saturday"

assert parking.day_compare('BEFORE_EQUAL', parking.today(), "wed"), "Wednesday <= Wednesday"
assert not parking.day_compare('BEFORE_EQUAL', parking.today(), "mon"), "Wednesday <= Monday"
assert     parking.day_compare('BEFORE_EQUAL', parking.today(), "saturday"), "Wednesday <= Saturday"
assert parking.today() <= parking.Day("Wed"), "Wednesday <= Wednesday"
assert not parking.today() <= parking.Day("Monday"), "Wednesday <= Monday"
assert parking.today() <= parking.Day("Sat"), "Wednesday <= Saturday"

assert not parking.day_compare('AFTER', parking.today(), "wed"), "Wednesday > Wednesday"
assert     parking.day_compare('AFTER', parking.today(), "mon"), "Wednesday > Monday"
assert not parking.day_compare('AFTER', parking.today(), "saturday"), "Wednesday > Saturday"
assert not parking.today() > parking.Day("Wed"), "Wednesday > Wednesday"
assert parking.today() > parking.Day("Monday"), "Wednesday > Monday"
assert not parking.today() > parking.Day("Sat"), "Wednesday > Saturday"

assert     parking.day_compare('AFTER_EQUAL', parking.today(), "wed"), "Wednesday >= Wednesday"
assert     parking.day_compare('AFTER_EQUAL', parking.today(), "mon"), "Wednesday >= Monday"
assert not parking.day_compare('AFTER_EQUAL', parking.today(), "saturday"), "Wednesday >= Saturday"
assert parking.today() >= parking.Day("Wed"), "Wednesday >= Wednesday"
assert parking.today() >= parking.Day("Monday"), "Wednesday >= Monday"
assert not parking.today() >= parking.Day("Sat"), "Wednesday >= Saturday"

assert not parking.day_compare('IS_NOT', parking.today(), "wed"), "Wednesday != Wednesday"
assert parking.day_compare('IS_NOT', parking.today(), "mon"), "Wednesday != Monday"
assert parking.day_compare('IS_NOT', parking.today(), "saturday"), "Wednesday != Saturday"
assert not parking.today() != parking.Day("Wed"), "Wednesday != Wednesday"
assert parking.today() != parking.Day("Monday"), "Wednesday != Monday"
assert parking.today() != parking.Day("Sat"), "Wednesday != Saturday"

print("Testing basic Time creation")
assert parking.Time(9, 30, 'pm'), "Create a night time"
assert parking.Time(9, 30, 'am'), "Create a morning time"
assert parking.Time(0, 20, 'pm'), "Create an afternoon time"
print("Testing today() function")
assert parking.now(), "Unable to create Today"

print("Testing comparisons for time")
parking._hour = 2
parking._minute = 30
parking._meridian = 'pm'

assert parking.time_compare('IS', parking.now(), 2, 30, 'pm'), "2:30pm == 2:30pm"
assert not parking.time_compare('IS', parking.now(), 9, 00, 'am'), "2:30pm == 9:00am"
assert not parking.time_compare('IS', parking.now(), 5, 00, 'pm'), "2:30pm == 5:00pm"
assert parking.now() == parking.Time(2, 30, 'pm'), "2:30pm == 2:30pm"
assert not parking.now() == parking.Time(9, 00, 'am'), "2:30pm == 9:00am"
assert not parking.now() == parking.Time(5, 00, 'pm'), "2:30pm == 5:00pm"

assert not parking.time_compare('BEFORE', parking.now(), 2, 30, 'pm'), "2:30pm < 2:30pm"
assert not parking.time_compare('BEFORE', parking.now(), 9, 00, 'am'), "2:30pm < 9:00am"
assert parking.time_compare('BEFORE', parking.now(), 5, 00, 'pm'), "2:30pm < 5:00pm"
assert not parking.now() < parking.Time(2, 30, 'pm'), "2:30pm < 2:30pm"
assert not parking.now() < parking.Time(9, 00, 'am'), "2:30pm < 9:00am"
assert parking.now() < parking.Time(5, 00, 'pm'), "2:30pm < 5:00pm"

assert parking.time_compare('BEFORE_EQUAL', parking.now(), 2, 30, 'pm'), "2:30pm <= 2:30pm"
assert not parking.time_compare('BEFORE_EQUAL', parking.now(), 9, 00, 'am'), "2:30pm <= 9:00am"
assert     parking.time_compare('BEFORE_EQUAL', parking.now(), 5, 00, 'pm'), "2:30pm <= 5:00pm"
assert parking.now() <= parking.Time(2, 30, 'pm'), "2:30pm <= 2:30pm"
assert not parking.now() <= parking.Time(9, 00, 'am'), "2:30pm <= 9:00am"
assert parking.now() <= parking.Time(5, 00, 'pm'), "2:30pm <= 5:00pm"

assert not parking.time_compare('AFTER', parking.now(), 2, 30, 'pm'), "2:30pm > 2:30pm"
assert     parking.time_compare('AFTER', parking.now(), 9, 00, 'am'), "2:30pm > 9:300am"
assert not parking.time_compare('AFTER', parking.now(), 5, 00, 'pm'), "2:30pm > 5:00pm"
assert not parking.now() > parking.Time(2, 30, 'pm'), "2:30pm > 2:30pm"
assert parking.now() > parking.Time(9, 00, 'am'), "2:30pm > 9:00am"
assert not parking.now() > parking.Time(5, 00, 'pm'), "2:30pm > 5:00pm"

assert     parking.time_compare('AFTER_EQUAL', parking.now(), 2, 30, 'pm'), "2:30pm >= 2:30pm"
assert     parking.time_compare('AFTER_EQUAL', parking.now(), 9, 00, 'am'), "2:30pm >= 9:00am"
assert not parking.time_compare('AFTER_EQUAL', parking.now(), 5, 00, 'pm'), "2:30pm >= 5:00pm"
assert parking.now() >= parking.Time(2, 30, 'pm'), "2:30pm >= 2:30pm"
assert parking.now() >= parking.Time(9, 00, 'am'), "2:30pm >= 9:00am"
assert not parking.now() >= parking.Time(5, 00, 'pm'), "2:30pm >= 5:00pm"

assert not parking.time_compare('IS_NOT', parking.now(), 2, 30, 'pm'), "2:30pm != 2:30pm"
assert parking.time_compare('IS_NOT', parking.now(), 9, 00, 'am'), "2:30pm != 9:00am"
assert parking.time_compare('IS_NOT', parking.now(), 5, 00, 'pm'), "2:30pm != 5:00pm"
assert not parking.now() != parking.Time(2, 30, 'pm'), "2:30pm != 2:30pm"
assert parking.now() != parking.Time(9, 00, 'am'), "2:30pm != 9:00am"
assert parking.now() != parking.Time(5, 00, 'pm'), "2:30pm != 5:00pm"

assert not parking.time_compare('BEFORE', parking.now(), 12, 00, 'pm'), "2:30pm < 12:00pm"
assert parking.time_compare('AFTER', parking.now(), 12, 00, 'pm'), "2:30pm > 12:00pm"
assert not parking.now() < parking.Time(12, 00, 'pm'), "2:30pm < Noon"
assert parking.now() > parking.Time(12, 00, 'pm'), "2:30pm > Noon"

print("Illegal Comparisons")
assert parking.today() != 5, "Should't be able to compare Day and number"
assert parking.now() != 5, "Should't be able to compare Time and number"
assert parking.now() != parking.today(), "Should't be able to compare Time and Day"
assert parking.today() != parking.now(), "Should't be able to compare Day and Time"
