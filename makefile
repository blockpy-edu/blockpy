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
	cp -R C:/Users/acbart/Projects/pedal/pedal/ C:/Users/acbart/Projects/blockpy/skulpt/src/lib/ ; cd skulpt/ ; rm src/lib/pedal/cait/ast_dump_magic.py ; python skulpt.py dist --compile ; cd ../