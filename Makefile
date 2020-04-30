


all: help

help:
	@echo -e "\n\nrun 'make pi_install' to setup the raspberry pi to be a hbot board.\n\n"

pi_install:
	rm -rf ~/.octoprint 
	ln -s ~/Marlin/.octoprint ~/
	for n in $(ls ~/Marlin/home/*) ; do rm -f ~/$n ; ln -s ~/Marlin/home/$n ~/ ; done
	sudo rm -rf /etc/restartd.conf
	sudo ln -s ~/Marlin/restartd.conf /etc/
	sudo touch /etc/rc.local
	cp /etc/rc.local /tmp/
	egrep -v 'exit|restartd' /tmp/rc.local  | sudo tee /etc/rc.local
	echo -e "${HOME}/Marlin/restartd > /tmp/restartd.log 2>&1 &\nexit 0" | sudo tee -a /etc/rc.local
	sudo chmod a+x /etc/rc.local
	chmod a+x ~/*
	sudo cp ~/Marlin/crontab /var/spool/cron/${USER}
	sudo systemctl stop cronie
	sudo systemctl start cronie
	sudo cp ~/Marlin/mjpg_streamer /bin/
	sudo cp ~/Marlin/wifiWatchdog /root/
