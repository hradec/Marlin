#!/bin/bash

tryagain() {
  echo $(cat ~/youtube.log  | grep 'Start upload' -A 1 ) | sed -e 's/\-\-/\n/g' | grep Error | awk '{print $3}' | while read p ; do 
	cmd=$(egrep "youtube.*$p" ~/youtube.log)
	yt=$(echo $cmd | awk -F' ' '{print $1}' | sed 's/ $//')
	title=$(echo $cmd | awk -F'title=|--description=' '{print $2}' | sed 's/ $//')
	desc=$(echo $cmd | awk -F'description=|--category=' '{print $2}' | sed 's/ $//')
	category=$(echo $cmd | awk -F'--category=|--tags' '{print $2}' | sed 's/ $//')
	tags=$(echo $cmd | awk -F'--tags=| ' '{print $(NF-1)}' | sed 's/ $//')
	file=$(echo $cmd | awk '{print $(NF)}' | sed 's/ $//')
	new_cmd="/usr/local/bin/youtube-upload --title='$title' --description='$desc' --category='$category' --tags='$tags' $file"
	eval $new_cmd
  done
}

tryagain >> ~/$0.log 2>&1

