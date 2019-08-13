========================================
HBot Marlin firmware and Octoprint Setup
========================================


Create a symlink of .octoprint to ~/.octoprint: `ln -s ~/Marlin/.octoprint ~/`

Install restartd, and copy restartd.conf to /etc/.

Add restard to /etc/rc.local, so restartd can start everything (and keep monitoring).

To install the firmware, just go in Marlin/Marlin, and run `make upload`.
