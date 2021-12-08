+++ 
title = "ESP8266 Temperature & Humidity Sensor" 
date = "2021-12-02T10:56:45+01:00" 
author = "Chun Heung Wong" 
cover = "" 
tags = ["ESP8266", "Arduino", "3d-printing", "JavaScript"] 
keywords = ["", ""] 
description = "" 
showFullContent = false
readingTime = false 
draft = false
+++

[Github Page](https://github.com/CH-Wong/esp8266-temp-hum-sensor)

# Dependencies

To compile your software for the ESP8266, you need the so-called board-manager for ESPs. You can add this URL `https://arduino.esp8266.com/stable/package_esp8266com_index.json` in your Arduino IDE under `File` -> `Preferences` -> `Additional Boards Manager URLs`.

Go to Tools > Board > Board Manager and search for 'esp8266'.

Official install guide  
https://github.com/esp8266/Arduino

(You can add multiple URLs, separating them with commas.)

Fortunately, there's another way: multicast DNS, or mDNS.
mDNS uses domain names with the .local suffix, for example http://esp8266.local. If your computer needs to send a request to a domain name that ends in .local, it will send a multicast query to all other devices on the LAN that support mDNS, asking the device with that specific domain name to identify itself. The device with the right name will then respond with another multicast and send its IP address. Now that your computer knows the IP address of the device, it can send normal requests.

Luckily for us, the ESP8266 Arduino Core supports mDNS:

Baud rate 115200

Then upload the webpages and scripts to SPIFFS using Tools > ESP8266 Sketch Data Upload.

https://tttapa.github.io/ESP8266/Chap01%20-%20ESP8266.html

