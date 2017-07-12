.PHONY: docs
docs:
	jsdoc -c docs/conf.json
merge:
	python merge.py
build:
	python build.py
update_kennel:
	python merge.py ; cd ../kennel ; python manage.py update_blockpy ; cd ../blockpy