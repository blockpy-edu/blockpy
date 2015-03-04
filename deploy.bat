set outputdir=C:\Users\acbart\Projects\blockpy\dist

mkdir %outputdir%

copy analyzer\analyzer.js %outputdir%

copy converter\python_to_blockly.js %outputdir%

copy blockly\blockly_compressed.js %outputdir%
copy blockly\blocks_compressed.js %outputdir%
copy blockly\python_compressed.js %outputdir%

mkdir %outputdir%\msg\js\
copy blockly\msg\js\en.js %outputdir%\msg\js\en.js

mkdir %outputdir%\media\
copy blockly\media\* %outputdir%\media\

copy skulpt\dist\skulpt.min.js %outputdir%
copy skulpt\dist\skulpt-stdlib.js %outputdir%

copy libs\* %outputdir%
