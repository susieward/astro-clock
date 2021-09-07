#!/bin/bash

cd ~/astro-clock
unset GIT_DIR
git pull
source env/bin/activate
pip3 install -r requirements.txt
deactivate
cd ~/
sudo -S systemctl restart astro-clock
