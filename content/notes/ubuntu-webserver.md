+++ 
title = "Ubuntu Webserver" 
date = "2022-01-08T12:11:20+01:00" 
author = "Chun Heung Wong"
cover = "" 
tags = ["", ""] 
keywords = ["", ""] 
description = "" 
showFullContent = false
readingTime = true 
draft = true
+++

# Should I use vim?
https://danielmiessler.com/study/vim/

https://rufus.ie/en/

https://ubuntu.com/download/server

VMWARE ESXI

TrueNAS (freenas  OS) for homeserver
TrueNAS Scale (Mark)
https://truecharts.org/manual/SUPPORT/
https://www.youtube.com/c/TrueCharts

Mediaserver
Plex or Jellyfin
radarr
jacket
sonarr
prowlarr
bazarr (subtitles)
android TV
    KODI
    Jellyfin

mobile NZB360

# Setting up Docker
https://docs.docker.com/engine/install/ubuntu/
https://docs.docker.com/compose/install/

```
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker YOURUSER
sudo apt-get install libffi-dev libssl-dev


sudo apt-get install -y python3 python3-pip

sudo apt-get remove python-configparser
```
To open up Port 53 for pihole
```
systemctl disable systemd-resolved.service
systemctl stop systemd-resolved
```

# Installing Pihole Docker
https://codeopolis.com/posts/quick-and-easy-steps-to-install-docker/
https://codeopolis.com/posts/running-pi-hole-in-docker-is-remarkably-easy/
https://hub.docker.com/r/pihole/pihole

```
version: "3"

# More info at https://github.com/pi-hole/docker-pi-hole/ and https://docs.pi-hole.net/
services:
  pihole:
    container_name: pihole
    image: pihole/pihole:latest
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "67:67/udp"
      - "6464:80"
    environment:
      TZ: 'Europe/Europe'
      # WEBPASSWORD: 'set a secure password here or it will be random'
    # Volumes store your data between container upgrades
    volumes:
      - './etc-pihole/:/etc/pihole/'
      - './etc-dnsmasq.d/:/etc/dnsmasq.d/'
    # Recommended but not required (DHCP needs NET_ADMIN)
    #   https://github.com/pi-hole/docker-pi-hole#note-on-capabilities
    cap_add:
      - NET_ADMIN
    restart: unless-stopped
```

# Jupyter Notebook

https://towardsdatascience.com/jupyter-data-science-stack-docker-in-under-15-minutes-19d8f822bd45
https://stackoverflow.com/questions/47580528/error-response-from-daemon-get-https-registry-1-docker-io-v2-dial-tcp-look


```
sudo nano /etc/resolv.conf
```
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```
`sudo systemctl restart docker`

```
# Define a local data directory
# Set permissions for the container:
#   sudo chown -R 1000 ${LOCAL_WORKING_DIR}

LOCAL_WORKING_DIR=/data/jupyter/notebooks

# Generate an access token like this
#   import IPython as IPython
#   hash = IPython.lib.passwd("S-E-C-R-E-T")
#   print(hash)
# You can use the script generate_token.py

ACCESS_TOKEN=sha1:d4c78fe19cb5:0c8f830971d52da9d74b9985a8b87a2b80fc6e6a

# Host port
PORT=8888

# Provide data sets
LOCAL_DATASETS=/data/jupyter/datasets

# Provide local modules
LOCAL_MODULES=/home/git/python_modules

# SSL
# Generate cert like this:
#   openssl req -x509 -nodes -newkey rsa:2048 -keyout jupyter.pem -out jupyter.pem
# Copy the jupyter.pem file into the location below.
LOCAL_SSL_CERTS=/opt/ssl-certs/jupyter
```


```
version:                "3"
services:
  scipy-notebook:
      image:    jupyter/scipy-notebook
      volumes:
        - ${LOCAL_WORKING_DIR}:/home/jovyan/work
        - ${LOCAL_DATASETS}:/home/jovyan/work/datasets
        - ${LOCAL_MODULES}:/home/jovyan/work/modules
        - ${LOCAL_SSL_CERTS}:/etc/ssl/notebook
      ports:
        - ${PORT}:8888
      container_name:   jupyter_notebook
      command: "start-notebook.sh \
        --NotebookApp.password=${ACCESS_TOKEN} \
        --NotebookApp.certfile=/etc/ssl/notebook/jupyter.pem"
      restart: unless-stopped
```


# Home Assistant
https://www.home-assistant.io/installation/linux

```
version: '3'
services:
  homeassistant:
    container_name: homeassistant
    image: "ghcr.io/home-assistant/home-assistant:stable"
    volumes:
      - /PATH_TO_YOUR_CONFIG:/config
      - /etc/localtime:/etc/localtime:ro
    restart: unless-stopped
    privileged: true
    network_mode: host
```

configuration.yaml

```
homeassistant:
  name: chun
  latitude: 51.9966
  longitude: 4.3530
  unit_system: metric
  time_zone: Europe/Amsterdam
  http:
    use_x_forwarded_for: true
    trusted_proxies:
      - 192.168.200.231
```

# Run on system reboot

Running crontab -e will allow you to edit your cron.
Adding a line like this to it:

@reboot /path/to/script



# Apache 

https://ubuntu.com/tutorials/install-and-configure-apache#1-overview

```
sudo apt update
sudo apt install apache2
sudo a2enmod proxy_http
sudo a2enmod proxy_connect
sudo a2enmod proxy_wstunnel
sudo a2enmod rewrite
```


# OpenVPN for hosting Games on LAN

https://forum.level1techs.com/t/guide-openvpn-for-security-privacy-and-gaming-how-to-setup-a-private-vpn-and-a-vlan-on-a-single-machine/140013