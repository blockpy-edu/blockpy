.PHONY: docs
docs:
	jsdoc -c docs/conf.json
merge:
	python merge.py
build:
	python build.py
update_kennel:
	python merge.py ; cd ../kennel ; C:/Users/acbart/Anaconda3/python.exe manage.py update_blockpy ; cd ../blockpy
update_pedal:
	cp -R C:/Users/acbart/Projects/pedal/pedal/ C:/Users/acbart/Projects/skulpt/src/lib/ ; cd ../skulpt/ ; python skulpt.py dist --compile ; cd ../blockpy/