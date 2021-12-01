+++
title = "How to build a static webpage with Hugo and host it on Azure Blobs"
date = "2021-11-30T19:46:42+01:00"
author = ""
authorTwitter = "" #do not include @
cover = ""
tags = ["", ""]
keywords = ["first", "post"]
description = ""
showFullContent = false
readingTime = false
draft = false
+++


# 1. Contents
On this page, I would like to show you how you can build a simple webpage like this one from just Markdown files using Hugo. Afterwards, I will show you how to host these files on an Azure storage container/blob.  I will then guide you through setting up your custom domain-name on this filehosting container, as well as adding an SSL certificate for HTTPS to boot. Lastly, I will walk you through updating your webpage by simply pushing to a Github repository with automated Github actions. In short, we will cover:

1. Creating a static webpage
2. Setting up Azure Blob/Container
3. Setting up your custom domain name
4. Setting up SSL certificate for HTTPS
5. Setting up deployment through Github actions

# 2. Creating a static webpage
This static website is created using [Hugo](https://gohugo.io/), a standalone package that transforms [Markdown (.md)](https://www.markdownguide.org/basic-syntax/) files to html/css. It also allows the use of pre-built themes, which are imported as github packages. Their [Quickstart page](https://gohugo.io/getting-started/quick-start/) is quite self-explanatory, but for the sake of completeness I will post post all the required steps here as well.

## 2.1 Installing Hugo
On **Linux**, you can quite simply install Hugo from your favorite package manager. E.g. for Ubuntu 

```bash
apt install hugo
```

For **Windows**, you can download the latest Hugo distribution from their (Github page)[https://github.com/gohugoio/hugo/releases] (e.g. hugo_0.89.4_Windows-64bit.zip). The .zip simply contains an executable `hugo.exe`and some other files, which we will need to make a home for. I recommend creating a new folder `C:\Hugo\bin`

```shell
mkdir 'C:\Hugo\bin'
```

Unzip the contents of the .zip file in `C:\Hugo\bin`. Now we need to add the executable `hugo.exe` to our environment path. 

```shell
$env:Path += 'C:\Hugo\bin'
```

Obviously you can also use the Windows explorer to make the folder, and Windows Search `Environment` to find `Edit the System Environment Variables` to achieve the same thing.

Finally, we are also making a folder in for our websites to be created later!

```shell
mkdir 'C:\Hugo\Sites'
```

## 2.2 Creating a website using Hugo
Navigate to `C:\Hugo\Sites`

```shell
cd 'C:\Hugo\Sites'
```

To create a new website scaffolding simply type 
```shell
hugo new site chunheungwong.nl
```

where you should replace `chunheungwong.nl` with website domain name you want to use. 



# 3. Setting up Azure Blob/Container


# 4. Setting up DNS settings


# 5. Setting up SSL certificate for HTTPS