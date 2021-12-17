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

Arduino in VSCode?
https://marketplace.visualstudio.com/items?itemName=vsciot-vscode.vscode-arduino
How to add ESP8266 board manager?

# Dependencies

To compile your software for the ESP8266, you need the so-called board-manager for ESPs. You can add this URL `https://arduino.esp8266.com/stable/package_esp8266com_index.json` in your Arduino IDE under `File` -> `Preferences` -> `Additional Boards Manager URLs`.

Go to Tools > Board > Board Manager and search for 'esp8266'.

Official install guide  
https://github.com/esp8266/Arduino

(You can add multiple URLs, separating them with commas.)




https://arduino.stackexchange.com/questions/38531/how-to-manage-dependencies


ADAfruit SSD1306 for screen
DHT sensor library for DHT 11


Baud rate 115200

# Setting up Wifi
```cpp
#include <ESP8266WiFi.h>        // Include the Wi-Fi library
#include <ESP8266WiFiMulti.h>   // Include the Wi-Fi-Multi library

const char* ssid     = "SSID";         // The SSID (name) of the Wi-Fi network you want to connect to
const char* password = "PASSWORD";     // The password of the Wi-Fi network

void setup() {
  Serial.begin(115200);         // Start the Serial communication to send messages to the computer
  delay(10);
  Serial.println('\n');
  
  WiFi.begin(ssid, password);             // Connect to the network
  Serial.print("Connecting to ");
  Serial.print(ssid); Serial.println(" ...");

  int i = 0;
  while (WiFi.status() != WL_CONNECTED) { // Wait for the Wi-Fi to connect
    delay(1000);
    Serial.print(++i); Serial.print(' ');
  }

  Serial.println('\n');
  Serial.println("Connection established!");  
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());         // Send the IP address of the ESP8266 to the computer
  }

```


# mDNS
Fortunately, there's another way: multicast DNS, or mDNS.
mDNS uses domain names with the .local suffix, for example http://esp8266.local. If your computer needs to send a request to a domain name that ends in .local, it will send a multicast query to all other devices on the LAN that support mDNS, asking the device with that specific domain name to identify itself. The device with the right name will then respond with another multicast and send its IP address. Now that your computer knows the IP address of the device, it can send normal requests.

Luckily for us, the ESP8266 Arduino Core supports mDNS:

https://stackoverflow.com/questions/51153306/not-able-to-browse-the-mdns-service-created-in-esp8266

```cpp
void setup() {
    //...
  if (!MDNS.begin("hello")) {             // Start the mDNS responder for esp8266.local
    Serial.println("Error setting up MDNS responder!");
  }
  Serial.println("mDNS responder started");
  MDNS.addService("http", "tcp", 80); 
}

void loop(void){
    //...
  server.handleClient();                    // Listen for HTTP requests from clients
}

```


Then upload the webpages and scripts to SPIFFS using Tools > ESP8266 Sketch Data Upload.

https://tttapa.github.io/ESP8266/Chap01%20-%20ESP8266.html

# SPIFFS

Need to add ESP8266 Filesystem uploader
https://github.com/esp8266/arduino-esp8266fs-plugin

in arduino project root

```shell
mkdir tools
cd tools
curl https://github.com/esp8266/arduino-esp8266fs-plugin/releases/download/0.5.0/ESP8266FS-0.5.0.zip -O ESP8266FS-0.5.0.zip
```


## Installation
1. Make sure you use one of the supported versions of Arduino IDE and have ESP8266 core installed.
2. Download the tool archive from releases page.
3. In your Arduino sketchbook directory, create tools directory if it doesn't exist yet. You can find the location of your sketchbook directory in the Arduino IDE at File > Preferences > Sketchbook location.
4. Unpack the tool into tools directory (the path will look like `<sketchbook directory>/tools/ESP8266FS/tool/esp8266fs.jar`).
5. Restart Arduino IDE.

Added the .jar file to my Github instead. Byebye updates


```cpp
#include <FS.h>   // Include the SPIFFS library
void setup () {
    SPIFFS.begin();                           // Start the SPI Flash Files System
}
```




# Over-the-Air updates
```cpp
void setup() {}
  ArduinoOTA.setHostname("ESP8266");
  ArduinoOTA.setPassword("esp8266");

  ArduinoOTA.onStart([]() {
    Serial.println("Start");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();
  Serial.println("OTA ready");
}

void loop() {
    ArduinoOTA.handle();
}
```

mDNS needs to be initialized after OTA because of hostname override
https://github.com/esp8266/Arduino/issues/3840


# Web-based filebrowser
https://github.com/esp8266/ESPWebServer/tree/master/examples/FSBrowser

```cpp
void setup(){
      // SERVER INIT
  //list directory
  server.on("/list", HTTP_GET, handleFileList);
  //load editor
  server.on("/edit", HTTP_GET, [](){
    if(!handleFileRead("/edit.htm")) server.send(404, "text/plain", "FileNotFound");
  });
  //create file
  server.on("/edit", HTTP_PUT, handleFileCreate);
  //delete file
  server.on("/edit", HTTP_DELETE, handleFileDelete);
  //first callback is called after the request has ended with all parsed arguments
  //second callback handles file uploads at that location
  server.on("/edit", HTTP_POST, [](){ server.send(200, "text/plain", ""); }, handleFileUpload);

  //called when the url is not defined here
  //use it to load content from SPIFFS
  server.onNotFound([](){
    if(!handleFileRead(server.uri()))
      server.send(404, "text/plain", "FileNotFound");
  });

  //get heap status, analog input value and all GPIO statuses in one json call
  server.on("/all", HTTP_GET, [](){
    String json = "{";
    json += "\"heap\":"+String(ESP.getFreeHeap());
    json += ", \"analog\":"+String(analogRead(A0));
    json += ", \"gpio\":"+String((uint32_t)(((GPI | GPO) & 0xFFFF) | ((GP16I & 0x01) << 16)));
    json += "}";
    server.send(200, "text/json", json);
    json = String();
  });
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
      server.handleClient();                    // Listen for HTTP requests from clients
}

String getContentType(String filename){
  if(filename.endsWith(".htm")) return "text/html";
  else if(filename.endsWith(".html")) return "text/html";
  else if(filename.endsWith(".css")) return "text/css";
  else if(filename.endsWith(".js")) return "application/javascript";
  else if(filename.endsWith(".png")) return "image/png";
  else if(filename.endsWith(".gif")) return "image/gif";
  else if(filename.endsWith(".jpg")) return "image/jpeg";
  else if(filename.endsWith(".ico")) return "image/x-icon";
  else if(filename.endsWith(".xml")) return "text/xml";
  else if(filename.endsWith(".pdf")) return "application/x-pdf";
  else if(filename.endsWith(".zip")) return "application/x-zip";
  else if(filename.endsWith(".gz")) return "application/x-gzip";
  return "text/plain";
}


bool handleFileRead(String path){  // send the right file to the client (if it exists)
  // Print the filename request in serial monitor
  Serial.println("handleFileRead: " + path);
  // If a folder is requested, send the index.html file instead as is standard for websites
  if(path.endsWith("/")) path += "index.html";           // If a folder is requested, send the index file

  // Get the MIME type from the path name
  String contentType = getContentType(path);             // Get the MIME type
  String pathWithGz = path + ".gz";
  
  if(SPIFFS.exists(pathWithGz) || SPIFFS.exists(path)){  // If the file exists, either as a compressed archive, or normal
    if(SPIFFS.exists(pathWithGz))                          // If there's a compressed version available
      path += ".gz";                                         // Use the compressed version
    File file = SPIFFS.open(path, "r");                    // Open the file
    size_t sent = server.streamFile(file, contentType);    // Send it to the client
    file.close();                                          // Close the file again
    Serial.println(String("\tSent file: ") + path);
    return true;
  }
  Serial.println(String("\tFile Not Found: ") + path);
  return false;                                          // If the file doesn't exist, return false
}

void handleFileUpload(){
  if(server.uri() != "/edit") return;
  HTTPUpload& upload = server.upload();
  if(upload.status == UPLOAD_FILE_START){
    String filename = upload.filename;
    if(!filename.startsWith("/")) filename = "/"+filename;
    Serial.print("handleFileUpload Name: "); Serial.println(filename);
    fsUploadFile = SPIFFS.open(filename, "w");
    filename = String();
  } else if(upload.status == UPLOAD_FILE_WRITE){
    //Serial.print("handleFileUpload Data: "); Serial.println(upload.currentSize);
    if(fsUploadFile)
      fsUploadFile.write(upload.buf, upload.currentSize);
  } else if(upload.status == UPLOAD_FILE_END){
    if(fsUploadFile)
      fsUploadFile.close();
    Serial.print("handleFileUpload Size: "); Serial.println(upload.totalSize);
  }
}

void handleFileDelete(){
  if(server.args() == 0) return server.send(500, "text/plain", "BAD ARGS");
  String path = server.arg(0);
  Serial.println("handleFileDelete: " + path);
  if(path == "/")
    return server.send(500, "text/plain", "BAD PATH");
  if(!SPIFFS.exists(path))
    return server.send(404, "text/plain", "FileNotFound");
  SPIFFS.remove(path);
  server.send(200, "text/plain", "");
  path = String();
}

void handleFileCreate(){
  if(server.args() == 0)
    return server.send(500, "text/plain", "BAD ARGS");
  String path = server.arg(0);
  Serial.println("handleFileCreate: " + path);
  if(path == "/")
    return server.send(500, "text/plain", "BAD PATH");
  if(SPIFFS.exists(path))
    return server.send(500, "text/plain", "FILE EXISTS");
  File file = SPIFFS.open(path, "w");
  if(file)
    file.close();
  else
    return server.send(500, "text/plain", "CREATE FAILED");
  server.send(200, "text/plain", "");
  path = String();
}

void handleFileList() {
  if(!server.hasArg("dir")) {server.send(500, "text/plain", "BAD ARGS"); return;}
  
  String path = server.arg("dir");
  Serial.println("handleFileList: " + path);
  Dir dir = SPIFFS.openDir(path);
  path = String();

  String output = "[";
  while(dir.next()){
    File entry = dir.openFile("r");
    if (output != "[") output += ',';
    bool isDir = false;
    output += "{\"type\":\"";
    output += (isDir)?"dir":"file";
    output += "\",\"name\":\"";
    output += String(entry.name()).substring(1);
    output += "\"}";
    entry.close();
  }
  
  output += "]";
  server.send(200, "text/json", output);
}

//format bytes
String formatBytes(size_t bytes){
  if (bytes < 1024){
    return String(bytes)+"B";
  } else if(bytes < (1024 * 1024)){
    return String(bytes/1024.0)+"KB";
  } else if(bytes < (1024 * 1024 * 1024)){
    return String(bytes/1024.0/1024.0)+"MB";
  } else {
    return String(bytes/1024.0/1024.0/1024.0)+"GB";
  }
}
```



# Authentication for filebrowser
https://www.mischianti.org/2020/11/09/web-server-with-esp8266-and-esp32-manage-security-and-authentication-4/

in index.html

```html
<script>
function logoutButton() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/logout", true);
  xhr.send();
  setTimeout(function(){ window.open("/logged-out","_self"); }, 1000);
}
</script>
```


In each function we need:

```cpp
  if (!httpServer.authenticate(wwwUsername, wwwPassword)) {
      httpServer.requestAuthentication();
  }
```


# NTP
```cpp
// For Network Time Protocol (NTP)
WiFiUDP UDP;
IPAddress timeServerIP;          // time.nist.gov NTP server address
const char* NTPServerName = "time.nist.gov";

const int NTP_PACKET_SIZE = 48;  // NTP time stamp is in the first 48 bytes of the message

byte NTPBuffer[NTP_PACKET_SIZE]; // buffer to hold incoming and outgoing packets
```


# Chart JS
https://www.chartjs.org/

## Zoom
https://www.chartjs.org/chartjs-plugin-zoom/samples/wheel/time.html