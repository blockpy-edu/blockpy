set outputdir=C:\Users\acbart\Dropbox\Public\blockpy

copy blockpy.html %outputdir%

mkdir %outputdir%\analyzer\
copy analyzer\analyzer.js %outputdir%\analyzer\

mkdir %outputdir%\kennel\
copy kennel\kennel.js %outputdir%\kennel\
copy kennel\kennel.css %outputdir%\kennel\

mkdir %outputdir%\converter\
copy converter\python_to_blockly.js %outputdir%\converter\
copy converter\renderBlocklyToPng.js %outputdir%\converter\

mkdir %outputdir%\blockly\
copy blockly\blockly_compressed.js %outputdir%\blockly\blockly_compressed.js
copy blockly\blockly_uncompressed.js %outputdir%\blockly\blockly_uncompressed.js
copy blockly\blocks_compressed.js %outputdir%\blockly\blocks_compressed.js
copy blockly\python_compressed.js %outputdir%\blockly\python_compressed.js
copy blockly\javascript_compressed.js %outputdir%\blockly\javascript_compressed.js

mkdir %outputdir%\blockly\msg\js\
copy blockly\msg\js\en.js %outputdir%\blockly\msg\js\en.js

mkdir %outputdir%\blockly\media\
copy blockly\media\* %outputdir%\blockly\media\

mkdir %outputdir%\skulpt\dist\
copy skulpt\dist\skulpt.min.js %outputdir%\skulpt\dist\skulpt.min.js
copy skulpt\dist\skulpt-stdlib.js %outputdir%\skulpt\dist\skulpt-stdlib.js

mkdir %outputdir%\libs\
copy libs\* %outputdir%\libs\

mkdir %outputdir%\images\
copy images\blockly-corgi-logo.png %outputdir%\images\blockly-corgi-logo.png