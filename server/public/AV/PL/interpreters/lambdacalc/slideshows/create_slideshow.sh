#!/bin/bash

########                   W A R N I N G                #################
#
# this script does not work any more because the version 1.4 scripts use
# jquery; one (painful?) solution is to set up node to work with jQuery
# another solution is to have a copy of the scripts that do not use
# jQuery (that's easy: it's only uses in the wrapper function at the top
# of each script). I did not yet implement either one of these solutions

display_usage() { 
        echo -e "This script takes two or three arguments:"
        echo -e " First argument:  'the lambda expression to evaluate'"
        echo -e " Second argument: a or n (i.e., applicative or normal order)"
        echo -e " Third argument:  name (i.e., output will go to AV/scripted/name.html)" 
        echo -e "                  This argument is optional. If it is omitted, the "
        echo -e "                  first argument is used as the name of the output file."
	echo -e "Usage:\n\t./create_slideshow <lambda exp> <a or n> <file name> \n" 
	} 

if [  $# -eq 2 ] || [  $# -eq 3 ]  ; then 
  exp=$1
  case "$2" in
   a) order="applicative" ;;
   *) order="normal" ;;
  esac

  if [ $# -eq 3 ] ; then
      name="$3.html"
  else
      name="$1.html"
  fi

echo "var LAMBDA = {};" > tmp.js;
echo "var running_in_node = true;" >> tmp.js
echo "var exp = '${exp}';"  >> tmp.js
echo "var require = undefined;"  >> tmp.js
echo "var order = '${order}';"  >> tmp.js
cat ../version1.4/scripts/grammar.js >> tmp.js
cat ../version1.4/scripts/absyn.js >> tmp.js
cat ../version1.4/scripts/interpreter.js >> tmp.js

cat ./utils/interpreter-top.html > "./AV/scripted/${name}"
echo "var order = '${order}';" >> "./AV/scripted/${name}"
echo "var lambdaexp = '${exp}';" >> "./AV/scripted/${name}"
echo "var reduction_steps = " >> "./AV/scripted/${name}"
node tmp.js >> "./AV/scripted/${name}"
rm tmp.js

if [  ${order} == "applicative" ] 
  then 
        cat ./utils/interpreter-bottom.html >> "./AV/scripted/${name}"
  else
        sed 's/Applicative/Normal/'  ./utils/interpreter-bottom.html >> "./AV/scripted/${name}"
fi
  
else
  display_usage
fi
