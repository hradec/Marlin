#!/bin/bash

#	--title="Timelapse: {gcode}" --description="Timelapse of {gcode}, printed and recorded via OctoPrint" --category="Science &
#            Technology" --tags=OctoPrint "{movie}" ; rm -rf "{movie}"

mov=$(echo "$@" | awk '{print $(NF)}')

if [ "$(echo $mov | grep fail)" == "" ] ; then
	echo /usr/local/bin/youtube-upload "$@" >> ~/youtube.log 2>&1
	/usr/local/bin/youtube-upload "$@" >> ~/youtube.log 2>&1 && rm -rvf "$movie" >> ~/youtube.log

fi
