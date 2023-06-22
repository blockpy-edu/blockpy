## Installation

### Note: do not clone the repository! This is handled automatically!

Before you do anything, install Node. It's located at https://nodejs.org/. If you're on Linux, it can be installed through your package
manager of choice, and [it's on Homebrew on Mac](https://formulae.brew.sh/formula/node). I tested it with Node v20, but v18 should also work.

To install BlockPy, run the installation script. The Windows version is [here](https://raw.githubusercontent.com/JAromando/blockpy-kennel/master/install/install-and-build.bat)
and the Linux/Mac version is [here](https://raw.githubusercontent.com/JAromando/blockpy-kennel/master/install/install-and-build.sh).
I recommend running this inside a folder, as it will create 3 other folders next to the script when ran.

After it's finished running, it will open a website in your browser. If you can't run any Python code, or an error pops up,
contact belewis (@craftablescience) on the Discord.

## Building

Assuming the script did work, you can now set up your dev environment. The project folder you want to open is the `blockpy` folder,
which was downloaded inside the `blockpy-edu` folder next to the script.
I personally recommend using VS Code or WebStorm, since blockpy is largely JS files.

When you start working, you'll want to run `npm run dev` in the console. This will automatically recompile the project when you
change the code. To see the results, open `tests/index.html` in a web browser. If it's already open, press `Ctrl+Shift+R` to fully
reload the site and see your changes pop up.
