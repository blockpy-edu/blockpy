.PHONY: docs
docs:
	jsdoc -c docs/conf.json
merge:
	python merge.py
build:
	python build.py
update_kennel:
	python merge.py ; cd ../kennel ; C:/Users/acbart/Anaconda3/python.exe manage.py update_blockpy ; cd ../blockpy
update_instructor:
	cp -R C:/Users/acbart/Projects/python-analysis/instructor/ C:/Users/acbart/Projects/blockpy/skulpt/src/lib/ ; cd skulpt/ ; python skulpt.py dist ; cd ../