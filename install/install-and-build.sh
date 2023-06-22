mkdir blockpy-edu
mkdir gamedev
mkdir pedal-edu


# Blockly
cd blockpy-edu && mkdir blockly && cd blockly
curl -L -o blockly_compressed.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459413482082325/blockly_compressed.js
curl -L -o blocks_compressed.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459413817622538/blocks_compressed.js
curl -L -o python_compressed.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459414291591198/python_compressed.js
mkdir msg && cd msg && mkdir js && cd js
curl -L -o en.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459414610350210/en.js
cd ../../../..


# Skulpt
cd blockpy-edu && mkdir skulpt && cd skulpt && mkdir dist && cd dist
curl -L -o debugger.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459171407839303/debugger.js
curl -L -o skulpt.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459171877584966/skulpt.js
curl -L -o skulpt.js.map https://cdn.discordapp.com/attachments/1113951882310864906/1117459172791947334/skulpt.js.map
curl -L -o skulpt-stdlib.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459173190418462/skulpt-stdlib.js
cd ../../..


# PygameSkulpt
cd blockpy-edu && mkdir pygame4skulpt && cd pygame4skulpt && mkdir dist && cd dist
curl -L -o pygameskulpt.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459171034533959/pygameskulpt.js
cd ../../..


# Designer
cd gamedev && mkdir designer && cd designer && mkdir dist-js && cd dist-js
curl -L -o skulpt-designer.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459414958473266/skulpt-designer.js
curl -L -o skulpt-designer-files.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459415294029944/skulpt-designer-files.js
cd ../../..


# Pedal
cd pedal-edu && mkdir pedal && cd pedal && mkdir dist-js && cd dist-js
curl -L -o skulpt-pedal.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459169545556069/skulpt-pedal.js
cd ../..
git clone https://github.com/pedal-edu/curriculum-ctvt
git clone https://github.com/pedal-edu/curriculum-sneks
cd ..


# BlockMirror
cd blockpy-edu && mkdir BlockMirror && cd BlockMirror && mkdir dist && cd dist
curl -L -o block_mirror.css https://cdn.discordapp.com/attachments/1113951882310864906/1117459169956610068/block_mirror.css
curl -L -o block_mirror.js https://cdn.discordapp.com/attachments/1113951882310864906/1117459170615099462/block_mirror.js
cd ../../..


# BlockPy
cd blockpy-edu && git clone https://github.com/THRALLab/blockpy-kennel blockpy && cd blockpy
npm install
npm run build


# Start test site
xdg-open "tests/index.html"
