#!/bin/bash

sudo -S systemctl stop astro-clock
cd ~/astro-clock
unset GIT_DIR
git pull
source env/bin/activate
pip3 install -r requirements.txt
deactivate
cd ~/
sudo -S systemctl start astro-clock
