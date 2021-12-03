+++
title = "How to build a static webpage with Hugo and host it on Azure Blobs"
date = "2021-11-30T19:46:42+01:00"
author = ""
authorTwitter = "" #do not include @
cover = ""
tags = ["static-file-hosting", "website", "tutorial"]
keywords = ["tutorial", "static-webpage"]
description = ""
showFullContent = false
readingTime = true
draft = false
+++

[Github Page](https://github.com/CH-Wong/chunheungwong.nl)

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

```powershell
mkdir 'C:\Hugo\bin'
```

Unzip the contents of the .zip file in `C:\Hugo\bin`. Now we need to add the executable `hugo.exe` to our environment path. 

```powershell
$env:Path += 'C:\Hugo\bin'
```

Obviously you can also use the Windows explorer to make the folder, and Windows Search `Environment` to find `Edit the System Environment Variables` to achieve the same thing.

Finally, we are also making a folder in for our websites to be created later!

```powershell
mkdir 'C:\Hugo\Sites'
```

## 2.2 Creating a website using Hugo
Navigate to `C:\Hugo\Sites`

```powershell
cd 'C:\Hugo\Sites'
```

To create a new website scaffolding simply type 
```powershell
hugo new site chunheungwong.nl
```

where you should replace `chunheungwong.nl` with website domain name you want to use. The `hugo` package has now helped you build a scaffolding for your webpage. It should look something like this:

```
--- chunheungwong.nl/
    |--- archetypes
    |--- content
    |--- data
    |--- layouts
    |--- resources
    |--- static
    |--- themes
    |--- config.toml
```

`hugo` can now translate this scaffolding into an html/css based static website. For testing purposes, it can locally host it on your machine if you enter

```powershell
hugo server -D
```

where the `-D` option is shorthand for `--buildDrafts`, which enables you to include draft posts on your test server. With a browser go to `localhost:1313` to view your website!

## 2.3 Adding content
At this point, your webpage is obviously very empty still. Let's add our first piece of content! Again, `hugo` can help you with creating files/folders for new content. For example, to create a your first posts into the new category `posts`, simply type

```powershell
hugo new posts/my-first-post.md
```

You will see that new files and folders have been created
```
--- chunheungwong.nl/
    |   ...
    |-- content
        |-- posts
            |-- my-first-post.md

```

What is more, you will see that your webpage at `localhost:1313` now has your new (empty) post! Let's fill that post with some content!

If you open `content/posts/my-first-post.md` in your IDE, you will find a barebones file:
```markdown
---
title: "Post"
date: 2021-12-02T20:37:47+01:00
draft: true
---
``` 

To add content to the webpage, you simply encode your webpage in [Markdown format](https://www.markdownguide.org/basic-syntax/), which will then be translated to html/css by hugo. Try adding some simple text to the .md file:

```markdown
# Hello this is my first Heading
You can do all sorts of formatting, like **bold-face** or *italics*, or `in-line codeblocks`. 
You can add an image using this notation:
![Floofy Dog](https://images.unsplash.com/photo-1530281700549-e82e7bf110d6)
```

After saving the file, the server should automatically rebuild the website with your changes. 

## 2.4 Shortcodes
To do more than just text and images, hugo has added some [shortcodes](https://gohugo.io/content-management/shortcodes/) for frequently used objects. Short code are `html`-like expression which are put between double accolades`{{}}`. To embed a tweet for example you can quite simply add 

```markdown
<!-- Insert this expression into double accolades {{}} -->
<tweet user="SanDiegoZoo" id="1453110110599868418">
``` 

Personally, I have the need to add mathematical equations. With the help of [Codecogs](https://www.codecogs.com/latex/eqneditor.php) I can convert LaTeX code to images. By writing a custom hook in `layouts/shortcodes/equation.html`

```html
{{ if .Get "src" }}
<image src="https://latex.codecogs.com/gif.latex?{{ .Get "src" | safeURL }}" style="border-radius: 2px; background-color:white; padding: 5px">
</image>
{{ end }}
```
The `{{ .Get "src" | safeURL }}` part essentially puts whatever I put in as the `src` variable into my `https` request to codecogs. For example `<equation-centered src="f(\phi)=e^{i\phi t}">"` results in

{{<equation-centered src="f(\phi)=e^{i\phi t}">}}

I think that's pretty cool!

# 3. Creating an Azure Blob for our Static Webpage

## 3.1 Creating a storage account
Creating an Azure Storage account
Now that we have some content we want to publish online, we need a place to put it. In this tutorial we will be making use of MSFT Azure because that's the only one I've tried so far. Naturally, similar services are available on AWS and Google Cloud. To make an Azure Container, you first need to **make an Azure account** at [https://portal.azure.com](https://portal.azure.com).

![Create Container](/static/static-webpage/create_storage.png)

We can now create our storage container: 
- Click `Storage Accounts`
- Click `+ Create`. 

![Storage Details](/static/static-webpage/storage-details.png)

- Create a new resource group if you do not have one. (e.g. static-webpages)
    These can be used to group certain expenses under a tag. 
- Give it a recognizable name (e.g. `chunportfoliowebpage`)
- Select a location (I usually put it somewhere close e.g. `(Europe) Germany West Central`)
- Performance `Standard` (Premium is very overkill)
- Account kind: `BlobStorage` (That's the cheapest one!)
- Replication: `Locally Redundant Storage (LRS)` 
    - "*... 99.999999999% (11 nines) durability of objects over a given year.*" [read more](https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy)

Press `Next: Advanced` to continue. 
- Under Security, uncheck `Require secure transfer for REST API operations`. We will need to access the blob without HTTPS for testing, and later reactivate this feature.
- Under `Blob storage`, select `Cool: Infrequently accessed data and backup scenarios` unless you are planning on having 1000's of visitors a day.
- Press `Review + create` to finish up the process

## 3.2 Setting up the storage account
![Storage Details](/static/static-webpage/static-webpage-setting.png)


The first thing we need to do to set up our blob is to enable it for use as a static webpage. 
1. From the Azure Portal, click on storage accounts.
2. Select your storage container from the list (e.g. `chunportfoliowebpage`)
3. In the left menu, under `Data management`, click on `Static website`.
4. Toggle Static website to `Enabled`.

This will show you your `Primary endpoint`, a webaddress you and others can use to access the files in your container that will make up your webpage later. 

5. Set `Index document name` to `index.html`.
6. Set `Error document path` to `404.html`.

The last two settings make sure that Azure knows how to route our webpage. Now that we have set-up our storage account to be able to host static webpages, we need to create a blob where we can actually upload our static webpage to. 


![Storage Details](/static/static-webpage/create_blob.png)

- Under `Data storage`, select `Containers`.
- Create a container by clicking the `+ Container` button. 
- Name the container `$web`.
- Set the `Public access level` to `Blob (anonymous read access for blobs only)`. 
    - To be honest, I am not completely sure what the difference is, but [this reference](https://www.serverless360.com/blog/azure-blob-storage-vs-file-storage) suggests that blobs are more suitable for our purposes.

You now have your first blob, called `$web`! You can access any files you upload here using the blobs URL. You can find the blob's URL by clicking on the `$web` blob, and accessing its `Properties` under `Settings` on the left. It should look something like `https://chunportfoliowebpage.blob.core.windows.net/$web`. If you got there in your browser, you will most likely encounter an error; we haven't uploaded any files yet! If you want to try, you can upload a file using the `Upload` of the `$web` blob. If you upload a text file, e.g. `test.txt`, you can access it using the URL `https://chunportfoliowebpage.blob.core.windows.net/$web/test.txt`. That's essentially how our webpage is going to work!

# 4. Setting up a custom domain
If you have a personal domain, you can redirect the traffic to that domain name to the Azure storage blob. However, depending on the location of the requester, the webpage could load quite slow. As such, it is recommended to use a Content-delivery Network (CDN). This is essentially a bunch of geographically separeted servers that cache our webpage to make it possible to load it faster ([read more here](https://www.akamai.com/our-thinking/cdn/what-is-a-cdn)).


## 4.1 Setting up Content Delivery Network (CDN)
Conveniently, Azure has its own CDN service which we can quite easily connect to our storage account and blobs. 

## 4.1 Creatig an endpoint for the CDN
To use the Azure CDN, we need to create a so-called endpoint. This is essentially another URL you can use to access your files, but this time they will be delivered by the CDN. To create an endpoint, navigate to `Azure CDN` under `Security + networking`. 

## 4.1 Adding a custom domain to our CDN

## 4.2 Setting up SSL certificate for HTTPS


## 3.3 Deploying our files to the Azure blob
We are now ready to upload files to our Azure and create our website! 

### 3.3.1 Manually deploying files

### 3.3.2 Automated upload using Github

#### Adding our files to a Github directory.


#### Authorizing Github to update our Azure Blob

#### Setting up Github actions for automated update on `git push`


