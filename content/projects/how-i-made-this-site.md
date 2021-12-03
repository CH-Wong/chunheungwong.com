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


On this page, I explain how I made this webpage. What makes this webpage "special", is that I it is a static webpage. No server needed, no fancy routing needed, just some static files hosted on a filehosting service. You can find the files needed to build this webpage on my [Github Page](https://github.com/CH-Wong/chunheungwong.com) as reference. 


# Contents
I will start with showing how you can build a simple webpage with relative ease using just Markdown (.md) text files with a package called [Hugo](https://gohugo.io/). Afterwards, I will show you how to host these files on [Azure's blobs](https://azure.microsoft.com/nl-nl/services/storage/blobs/). I will then guide you through setting up your custom domain-name for your blob, as well as adding an SSL certificate for HTTPS, and delivering your content through the [Azure Content-delivery Network (CDN)](https://azure.microsoft.com/nl-nl/services/cdn/). Lastly, I will walk you through updating your webpage by simply pushing to a Github repository with automated Github actions. In short, we will cover:

1. [Creating a static webpage with Hugo](#hugo)
2. [Setting up Azure Blob/Container](#settingupblob)
3. [Setting up a custom domain](#customdomain)
4. [Setting up deployment through Github actions](#githubdeployment)

# 1. Creating a static webpage with Hugo {#hugo}
This static website is created using [Hugo](https://gohugo.io/), a standalone package that transforms [Markdown (.md)](https://www.markdownguide.org/basic-syntax/) files to html/css. It also allows the use of pre-built themes, which are imported as github packages. Their [Quickstart page](https://gohugo.io/getting-started/quick-start/) is quite self-explanatory, but for the sake of completeness I will post post all the required steps here as well.

## 1.1 Installing Hugo
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

## 1.2 Creating a website using Hugo
Navigate to `C:\Hugo\Sites`

```powershell
cd 'C:\Hugo\Sites'
```

To create a new website scaffolding simply type 
```powershell
hugo new site chunheungwong.com
```

where you should replace `chunheungwong.com` with website domain name you want to use. The `hugo` package has now helped you build a scaffolding for your webpage. It should look something like this:

```
--- chunheungwong.com/
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

## 1.3 Adding content
At this point, your webpage is obviously very empty still. Let's add our first piece of content! Again, `hugo` can help you with creating files/folders for new content. For example, to create a your first posts into the new category `posts`, simply type

```powershell
hugo new posts/my-first-post.md
```

You will see that new files and folders have been created
```
--- chunheungwong.com/
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

## 1.4 Adding a theme, they are very pretty!


## 1.5 Shortcodes
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

# 2. Creating an Azure Blob for our Static Webpage {#settingupblob}

## 2.1 Creating a storage account
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

## 2.2 Setting up the storage account
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

# 3. Setting up a custom domain {#customdomain}
If you have a personal domain, you can redirect the traffic to that domain name to the Azure storage blob. However, depending on the location of the requester, the webpage could load quite slow. As such, it is recommended to use a Content-delivery Network (CDN). This is essentially a bunch of geographically separeted servers that cache our webpage to make it possible to load it faster ([read more here](https://www.akamai.com/our-thinking/cdn/what-is-a-cdn)).


## 3.1 Setting up Content Delivery Network (CDN)
Conveniently, Azure has its own CDN service which we can quite easily connect to our storage account and blobs. To use the Azure CDN, we need to create a so-called endpoint. This is essentially another URL you can use to access your files, but this time they will be delivered by the CDN. To create an endpoint, navigate to `Azure CDN` under `Security + networking`. 


Under `New endpoint`, fill in
- CDN profile: e.g. `staticwebsites`. 
  - This is used to group similar CDN endpoints you might make in the future. 
- Pricing tier: `Standard Microsoft`
- CDN endpoint name: e.g.  `chunheungwong`
- Origin hostname: choose `...web.core.windows.net (Static website)`
- Press `Create`

It might take a few moments for the CDN endpoint to be created.

## 3.2 Adding a custom domain to our CDN
Now that we have a CDN endpoint, we can add custom domains to it. We first need to edit our DNS settings At the CDN endpoint page on the Azure Portal, copy the `Endpoint hostname` at the topright (something ending with `.azureedge.net`). Go to your DNS provider (GoDaddy.com, transip.nl, Cloudflare) and add a CNAME record to your domain

| NAME | TTL | TYPE | VALUE |
|---|---|---|---|
| www | 5min | CNAME | yourendpoint.azureedge.net |
| cdnverify | 5min | ALIAS | yourendpoint.azureedge.net |

These records allow Azure to validate that this domain is indeed yours and can be used to connect to the endpoint. 
The first one is to allow the subdomain `www.chunheungwong.com` to also access the blob. The second is to enable  

Simply click on your CDN endpoint that is now listed in the same page above. 

## 3.3 Setting up SSL certificate for HTTPS
To add an SSL certificate for HTTPS, you simply click on the custom domain in your specific CDN endpoint, and toggle `Custom domain HTTPS` to `On`. That's it. Verifying the domain can take quite some time, so hang tight!


# 4 Deploying our files to the Azure blob {#githubdeployment}
We are now ready to upload files to our Azure and create our website! First let's convert our Hugo files to the files we need for our actual webpage. This is very simple. Navigate to the hugo website directory and simply enter:

```powershell
cd "C:\Hugo\Sites\chunheungwong.com
hugo
```
Yes. Just `hugo`. You will now find that a `/public/` folder was added to your files. This is our website! We want to upload this folder to our Azure blob. There are many ways to do this. You can manually upload them through the portal using the `upload` button located in your blob. You can install a Virtual Studio Code add-on called [Azure Storage](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestorage) that connects to your blob and uploads it for you. Personally, I wanted to try using Github actions for the first time, as I have never tried automated deployment. Have to start with CI/CD somewhere right? 

## 4.1 Automated deployment using Github actions
What we are trying to achieve is having Github not only host the files for version control, but actually use Github's services to 

1. Store our files.
2. Using our files to build our webpage (similar to our `hugo` command).
3. Authenticate with our Azure blob.
4. Update the filestorage to match our updated webpage.

First things first, let's get our `C:/Hugo/Sites/chunheungwong.com` directory on Github. Create a new repository on github called `chunheungwong.com`, where obviously you fill in the name of your own domain. This repository **needs to be public**, because Github actions are only available for public (or Enterprise) repositories. 

To connect your local directory with your remote Github repository, you can use

```git
# Go to your directory
cd 'C:\Hugo\Sites\chunheungwong.com'
# Initialize this as a git directory
git init
# Add your GitHub repository as remote origin
git remote add origin https://github.com/CH-Wong/chunheungwong.com
# Pull the data
git pull origin main
```

where again, you should replace `CH-Wong` with your username and `chunheungwong.com` with the name of your own GitHub repository. At this point I would recommended creating a `.gitignore` file with `public/*` in it, to prevent it from being pushed to GitHub everytime. 

To set-up GitHub actions, we are going to create a new folder `.../chunheungwong.com/.github` with the file `main.yaml` inside, which contains instructions for GitHub to build and upload our website. Inside of this file, copy the copy the following code: 

```yaml
# This is a basic workflow to help you get started with Actions

name: Build and deploy Hugo static webpage to Azure blob

# Controls when the workflow will run
on:
  # Triggers the workflow on push but only for the main branch
  push:
    branches: [ main ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    environment: build-environment
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:

      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v2
        with:
          submodules: true
          fetch-depth: 0
    
        # Uses code from user peaceiris to setup a hugo docker for us to build our website with
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      # Build our website using hugo
      - name: Build site
        run: hugo --minify

      # Connect to azure and upload the /public directory to our $web storage blob using code from user bacongobbler
      - name: Deploy to Azure Blob Storage
        uses: bacongobbler/azure-blob-storage-upload@v1.2.0
        with:
            source_dir: public #Hugo build generates this file after build
            container_name: $web
            connection_string: ${{ secrets.BLOB_STORAGE_CONNECTION_STRING }}

```
Luckily, the `.yaml` file is pretty self-explanatory. The first part essentially tells GitHub to perform these set of actions whenever we push something to the branch `main`. A few things I learned was the syntax `uses:.../...`. This essentially points to a piece of code on Github, and uses it for our GitHub action! For example, the `uses: peaceiris/actions-hugo@v2` essentially just uses a spcific version of https://github.com/peaceiris/actions-hugo within this Github workflow. 

## 4.2 Authorizing Github to update our Azure Blob

![Access Keys](/static/static-webpage/access-keys.png)

Now that we have our set of commands, all that is left is to actually upload the code! For that we need to make sure GitHub has the right credentials to connect to Azure. In the Azure Portal, go back to our storage account, and find `Access keys` under `Security + networking`. Click on the `Show keys` button, and copy paste either of the `Connection string` fields. Don't share this key with anyone else, as it grants read+write access to your storage blob and hence the content of your webpage!

We need to add this connection string to our GitHub repository. In your browser, go to your GitHub repository and lcoate the Settings. Under `Environments`, we are going to create a `New environment`, named `build-environment` (because we already wrote that in `main.yaml`!). Here, press the `+ Add Secret` button. Name it `BLOB_STORAGE_CONNECTION_STRING` (again, already decided in `main.yaml`) and copy-paste the connection string we obtain from the Azure portal in the `Value` field. That's it! 

## 4.3 Deploying to Azure Blob with GitHub

With all our work done now, we can finally deploy our webpage! Simply perform a standard commit and pull

```git
git add .
git commit -m "First deployment!"
git push
```

and watch the magic happen at under the `Actions` of your GitHub page! After the build is complete, you should also see that files have been added to the `$web` blob in your Azure Portal. But most importantly, your website should now be accessible on your custom domain!

# Conclusion

I hope this tutorial was useful for you. It is an excessively verbose resource, which is something that I would have liked to have when I dove into this for the first time a few weeks ago. I hope it helps someone get through all the basic ideas relatively painlessly. 

Cheers,


Chun



