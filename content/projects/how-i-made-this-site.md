+++
title = "How to build a static website with Hugo and host it on Azure Blobs"
date = "2021-11-30T19:46:42+01:00"
author = "Chun Heung Wong"
authorTwitter = "" #do not include @
cover = ""
tags = ["static", "website", "tutorial"]
keywords = ["tutorial", "static-webpage"]
description = ""
showFullContent = false
readingTime = true
draft = false
+++

This is a complete guide on how I made this website. What makes this webpage "special", is that it's a [static webpage](https://www.sanity.io/what-is-a-static-site). No server needed, no fancy routing needed, just some static files hosted on a filehosting service. This tutorial is meant for people who have never made a static webpage before, because that was me before I made this post. 

For reference, you can find the files I used to build this website on my [Github Page](https://github.com/CH-Wong/chunheungwong.com). 


# Contents
I will start with showing you how to build a website with relative ease with just text files styled in [Markdown (.md)](https://www.markdownguide.org/basic-syntax/) using a package called [`hugo`](https://gohugo.io/). Afterwards, I will show you how to host these files on an [Azure Storage Blob](https://azure.microsoft.com/nl-nl/services/storage/blobs/). Then I will help you deliver your website through the [Azure Content-delivery Network (CDN)](https://azure.microsoft.com/nl-nl/services/cdn/). Next we will see automated deployment of your website to a blob using Github actions. Lastly, I will guide you through setting up a custom domainname for your blob, as well as adding an SSL certificate for HTTPS, 

In short, we will cover:

1. [Creating a static webpage with Hugo](#hugo)
2. [Setting up Azure Blob](#settingupblob)
3. [Deploying files to an Azure Storage Blob](#deployment) 
4. [Setting up a custom domain](#customdomain)

# 1. Creating a static webpage with Hugo {#hugo}
This website is created using [hugo](https://gohugo.io/), a standalone package that transforms [Markdown (.md)](https://www.markdownguide.org/basic-syntax/) text files to html/css + JS. Their [Quickstart page](https://gohugo.io/getting-started/quick-start/) is quite self-explanatory, but for the sake of completeness I will post my own learning process here as well.

## 1.1 Installing Hugo
On **Linux**, you can quite simply install Hugo using your favorite package manager. E.g. for Ubuntu 

```bash
apt install hugo
```

For **Windows**, you need to download the latest Hugo distribution from their [Github page](https://github.com/gohugoio/hugo/releases). The `hugo_x.xx.x_Windows-64bit.zip` contains an executable `hugo.exe`and some other files, which we will need to give a place to live. We also need a place for your website file to be stored later. In your terminal, use

```powershell
mkdir 'C:\Hugo\bin'
mkdir 'C:\Hugo\Sites'
```

and unzip the contents of the .zip file in `C:\Hugo\bin`. We need to add this folder to our system environment `Path` such that Windows can find `hugo.exe` inside. 

```powershell
$env:Path += ';C:\Hugo\bin'
```



The `;` colon is the standard delimiter for the `Path` variable. Obviously you can also use Windows explorer to make the folder, and the `Edit the System Environment Variables` option in Windows to achieve the same thing.

## 1.2 Creating a website using Hugo
With that set up, we can start creating our website! To create a new website scaffolding simply type 

```powershell
cd 'C:\Hugo\Sites'
hugo new site yourdomain.com
```

where you should replace `yourdomain.com` with website domain name you want to use. The `hugo` package has now helped you build a scaffolding for your webpage. It should look something like this:

```
--- yourdomain.com/
    |--- archetypes/
    |--- content/
    |--- data/
    |--- layouts/
    |--- resources/
    |--- static/
    |--- themes/
    |--- config.toml
```
which at this point are mostly empty folders. Don't worry, we will be adding things there soon! `hugo` can translate these files a website. For testing purposes, you can locally host your website

```powershell
hugo server -D
```

where the `-D` option is shorthand for `--buildDrafts` which includes draft posts on your test server. Your website is running! In your webbrowser, go to `localhost:1313` to view your website.

## 1.3 Adding content
At this point, your webpage is obviously very empty. Let's add our first piece of content! For example, to create a your first post into the category `posts`, simply type

```powershell
hugo new posts/my-first-post.md
```

You will see that new files and folders have been created:
```
--- yourdomain.com/
    |   ...
    |-- content/
        |-- posts/
            |-- my-first-post.md

```
You can also do these actions manually, but you might miss out on some template features `hugo` offers. You might also have noticed that your webpage at `localhost:1313` has automatically rebuilt and now has your new (empty) post! Let's fill that post with some content content. If you open `my-first-post.md` in your IDE, you will find a bare-bones file:
```md
---
title: "Post"
date: 2021-12-02T20:37:47+01:00
draft: true
---
``` 

To add content to the post, you simply type  in [Markdown format](https://www.markdownguide.org/basic-syntax/), which will then be translated to `html/css` by `hugo`. Try adding this example text to the .md file:

```md
# Hello this is my level 1 Heading
You can do all sorts of formatting, like **bold-face** or *italics*, or `in-line codeblocks`. 

## This is my level 2 heading. I like dogs!
You can add an image using this notation:

![Floofy Dog](https://images.unsplash.com/photo-1530281700549-e82e7bf110d6)
```

After saving the file, the server should automatically rebuild the website with your changes. That's a floofy dog!

## 1.4 Shortcodes
To do more than just text and images, `hugo `has added some [shortcodes](https://gohugo.io/content-management/shortcodes/) for frequently used objects. Short code are `html`-like expression which are put between double accolades`{{}}`. To embed a tweet in your website for example you can quite simply add this[^4]

```markdown
<!-- Insert this expression into double accolades {{}} -->
<tweet user="SanDiegoZoo" id="1453110110599868418">
``` 
where you pass the `username` and `tweet ID` to the shortcode. 
[^4]: I can't actually show the correct code with {{}}, because my Markdown thinks its a shortcode and will render the shortcode instead! [This link](https://www.getzola.org/documentation/content/shortcodes/#shortcodes-without-body) was the closest I got to a solution, but alas...


Personally, I have the need to add mathematical equations. With the help of [Codecogs](https://www.codecogs.com/latex/eqneditor.php) I can convert LaTeX code to images and embed them. I wrote a custom shortcode in `layouts/shortcodes/equation.html` to do just that:

```html
{{ if .Get "src" }}
<image src="https://latex.codecogs.com/gif.latex?{{ .Get "src" | safeURL }}" class="{{ with .Get "position"}}{{ . }}{{ else -}} left {{- end }}" alt="LaTeX Equation" style="border-radius: 2px; background-color:white; padding: 5px">
</image>
{{ end }}
```
The `{{ .Get "src" | safeURL }}` part essentially puts whatever I pass as the `src` variable into my `https` request to Codecogs given that its a safeURL. For example:

```md
<!-- Insert this expression into double accolades {{}} -->
<equation src="f(\phi)=e^{i\phi t}">
```
{{<equation src="f(\phi)=e^{i\phi t}">}}

I also added the `position` variable to be able to show centered equations:

```md
<!-- Insert this expression into double accolades {{}} -->
<equation src="H=P_\theta \dot{\theta}+P_\phi \dot{\phi}-L" position="center">
```
{{<equation src="H=P_\theta \dot{\theta}+P_\phi \dot{\phi}-L" position="center">}}

I think that's pretty cool!


## 1.5 Archetypes
Hugo uses so-called `archetypes`, which is just a fancy word for `template`. By creating a `/yourdomain.com/archetypes/default.md` file, the contents of that file will be added at the top of any new content. Make a `default.md` file containing:

```md
+++ 
title = "title" 
date = "{{ .Date }}" 
draft = false
+++
Created on: {{ .Date }}
```


and try running the command below and see for yourself! Your new post should now also include the date in the post

```powershell
hugo new posts/my-second-post.md
```

You can make *category-specific* templates by creating new archetypes using the category as the filename (e.g. `posts.md`). This needs to be palced in the folder `/archetypes` your root.

```
--- yourdomain.com/
    |   ...
    |-- archetypes/
        |-- default.md
        |-- posts.md
```

Write some stuff in the file and run the following command to see the results:

```powershell
hugo new posts/post-with-custom-template.md
```

## 1.6 Adding a theme
To spice up your webpage, we can add pre-built themes. A selection of themes is available on the hugo website https://themes.gohugo.io/. For this page, I used the [terminal theme](https://themes.gohugo.io/themes/hugo-theme-terminal/). 

Let's try to add a different one; the [novela theme](https://themes.gohugo.io/themes/hugo-theme-novela/) for example. Click on the link and press `Download`. You might be just as suprised as I was to find a [GitHub repository](https://github.com/forestryio/hugo-theme-novela)! If you think about it, you realise that sharing themes through GitHub is a fantastic method for a version-controlled distribution. 

But how do we use this theme for our own website? There are three ways to do this. First, navigate to your root folder `cd 'C:\Hugo\Sites\yourdomain.com'`

1. (Easiest) `git clone` the repo into your `/themes` folder[^1]
    ```git
    git clone https://github.com/forestryio/hugo-theme-novela themes`
    ```
2. (Recommended) Adding the theme as a git submodule[^2]
    ```git
    git submodule add https://github.com/forestryio/hugo-theme-novela themes/hugo-theme-novela` 
    ```
3. (Cool kids only) Using hugo mods (you will need to install [Go](https://go.dev/doc/install) for this)[^3]
    ```git
    hugo mod init yourdomain.com
    ```

In all cases, you will need to edit your `config.toml` file to point towards the theme you want to use.

```
# config.toml for git clone or git submodule
baseURL = 'https://www.yourdomain.com'
languageCode = 'en-us'
title = "Chun's Website"
theme = 'hugo-theme-novela'
```

```
# config.toml for hugo mod init
baseURL = 'https://www.yourdomain.com'
languageCode = 'en-us'
title = "Chun's Website"
[module]
[[module.imports]]
  path = 'github.com/spf13/hyde'
```
Your website should now be stylized using the `novela` theme! Most themes also allow for easy configuration of pre-defined settings using the `config.toml` file. The syntax for these configurations can usually be found on the theme's Github repository. For the `novela` theme, we find easy setup for social accounts:


```
# Edit your config.toml to add the theme settings:
# Novela settings
paginate = 6

[social]
twitter= "https://twitter.com/forestryio"
github= "https://github.com/forestryio/novela-hugo-starter"
linkedin= "https://www.linkedin.com/company/forestry.io"
instagram = "#"
dribbble = "#"
youtube = "#"

[taxonomies]
author = "authors"
```

[^1]: **Directly cloning themes (simple)** is the simplest to understand: you basically copy all the files you need into your directory. 

[^2]: **Adding theme as submodule (recommended)** Allows it to be tracked separately from your main git repository. This could be nice for separate version control, and is the method recommended by `hugo`.

[^3]: **Using Hugo Mods (for cool kids only)** for themes allows you to build you website without ever having to pull the directory. This is cool because theres less files in your repository, and keeps everything remote that is remote. However, it's quite a hassle to view the theme's files if you are trying to tweak them, and extra import statements are required later on when we deploy automate the deployment of this website through Github Actions.


# 1.7 Editing Themes
`hugo` enables you to edit themes by overriding (part) of them. If you navigate to `/themes/hugo-theme-novela/archetypes` you will find the `default.md` file containing:

```markdown
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
hero: /images/hero-3.jpg
excerpt:
draft: true
---
```

 If you are not happy with this `default.md`, you can override it by adding your own `default.md` file in your root folder 
```
--- yourdomain.com/
    |-- ...
    |-- archetypes/
    |   |-- default.md          # This one overrides...
    |-- ...
    |-- themes
    |   |-- hugo-theme-novela/
            |-- archetypes/
                |-- default.md  # ... this one.
```

The key is that the filename and folder structure must be **identical**. Try creating creating a `default.md` in your `/yourdomain.com/archetypes` folder, and use `hugo new posts/new-archetype-post.md` to check the result.


# 2. Creating an Azure Storage Blob {#settingupblob}
## 2.1 Creating a storage account
Now that we have some content we can publish, we need a place to put it online. In this tutorial we will be making use of MSFT Azure because that's the only one I've tried so far. Naturally, similar services are available on AWS and Google Cloud. To make an Azure Blob, you first need to **make an Azure account** at [https://portal.azure.com](https://portal.azure.com).

![Create Blob](/static/static-webpage/create_storage.png)

We now need to create a Storage Account: 
- Click `Storage Accounts`
- Click `+ Create`. 

![Storage Details](/static/static-webpage/storage-details.png)

- Create a new resource group if you do not have one (e.g. static-webpages). 
    These can be used to group certain expenses under a tag. 
- Give the Storage Account a recognizable name (e.g. `chunportfoliowebpage`).
- Select a location (I usually put it somewhere close e.g. `(Europe) Germany West Central`).
- Performance `Standard` (Premium is very overkill).
- Account kind: `BlobStorage` (That's the cheapest one!).
- Replication: `Geo Redundant Storage (GRS)` 
    - "*... 99.999999999% (11 nines) durability of objects over a given year.*" [read more](https://docs.microsoft.com/en-us/azure/storage/common/storage-redundancy)
- Press `Next: Advanced` to continue. 
- Under `Blob storage`, select `Hot` (no costs per GB loaded).
- Press `Review + create` to finish up the process

## 2.2 Setting up the storage account
![Storage Details](/static/static-webpage/static-webpage-setting.png)

The first thing we need to do is enable the static webpage option for our blob. 
1. From the Azure Portal, click on storage accounts.
2. Select your storage blob from the list (e.g. `chunportfoliowebpage`)
3. In the left menu, under `Data management`, click on `Static website`.
4. Toggle Static website to `Enabled`.
5. Set `Index document name` to `index.html`.
6. Set `Error document path` to `404.html`.

This will show you your `Primary endpoint`, a webaddress you and others can use to access files in your blob (and thus your website!). The last two settings make sure that Azure knows how to route our webpage.

 Now that we have set-up our storage account to be able to host static webpages, we need to create a blob where we can actually upload our static webpage to. 

![Storage Details](/static/static-webpage/create_blob.png)

- Under `Data storage`, select `Containers`.
- Create a blob by clicking the `+ Container` button. 
- Name the blob `$web`.
- Set the `Public access level` to `Blob (anonymous read access for blobs only)`. 
    - To be honest, I am not completely sure what the difference is, but [this reference](https://www.serverless360.com/blog/azure-blob-storage-vs-file-storage) suggests that blobs are more suitable for our purposes.

You now have a storage blob called `$web`! You can access any files you upload here using the blob's `Primary endpoint`. You can find the blob's `Primary endpoint` by clicking on the `$web` blob, and accessing its `Properties` under `Settings` on the left. It should look something like 
```
https://yourstorageblob.blob.core.windows.net/$web
``` 
If you go there in your browser, you will most likely encounter an error; that's because we haven't uploaded any files yet! If you want to try, you can upload a file using the `Upload` button. You could upload e.g. `test.txt`, and see if you can access it using 
```
https://yourstorageblob.blob.core.windows.net/$web/test.txt
```

That's essentially how our webpage is going to work!

## 2.3 Connecting to the Content Delivery Network (CDN)
Having external users access your storage blob via the `Primary endpoint` can turn out to be quite slow depending on the location of the requester. Conveniently, Azure has its own [Content-delivery Network (CDN)](https://www.akamai.com/our-thinking/cdn/what-is-a-cdn). This is essentially a bunch of geographically separated servers that cache our webpage to make it possible to load it faster and with increased reliability. 

To use the Azure CDN, we need to create a new endpoint. This is essentially another URL you can use to access your files, but this time they will be delivered through the CDN. To create an endpoint, open up your storage account and navigate to `Azure CDN` under `Security + networking`. 

Under `New endpoint`, fill in
- CDN profile: e.g. `staticwebsites` (used to group endpoints you might make in the future). 
- Pricing tier: `Standard Microsoft`
- CDN endpoint name: e.g.  `chunheungwong`
- Origin hostname: choose `...web.core.windows.net (Static website)`
- Press `Create`

It might take a few moments for the CDN endpoint to be created. After it's created, you can click on it to see its the `Endpoint hostname`, which should look something like this: 
```
https://yourendopoint.azureedge.net
```
If you added a `test.txt` file previously, you can now also access it with `https://yourendpoint.azureedge.net/test.txt`!

# 3 Deploying files to an Azure Storage Blob {#deployment}
Now that we have easy access to our blob through the CDN, we are now ready to upload our website to it. First we need to convert our `hugo` files into the actual `html/css` website. Navigate to the directory of your website and simply enter:

```powershell
cd "C:\Hugo\Sites\yourdomain.com
hugo
```
Yes. Just `hugo`. You will now find that a `/public/` folder was added to your files. This is our website! We want to upload this folder to our Azure blob. There are many ways to do this. For example:

1. You can manually upload them using the Azure portal by clicking the `upload` button in your `$web` blob.
2. Within the [Virtual Studio Code (VSCode)](https://code.visualstudio.com/) IDE, you can install an add-on called [Azure Storage](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestorage) that connects to your `$web` blob and uploads it for you. 
3. **You can automatically build and deploy your website through GitHub.**

Personally, I wanted to try using Github actions for the first time, as I have never tried automated deployment. Have to start with [CI/CD](https://www.redhat.com/en/topics/devops/what-is-ci-cd) somewhere right? I'll try to show you what I've learned so far.

## 3.1 Automated deployment using Github actions
What we are trying to achieve is to use Github not only for version control, but actually use Github's other services to 

1. Create an environment to perform the build.
2. Use our `hugo` files to build our website.
2. Connect and authenticate with our Azure blob.
3. Update the Azure blob to match our updated webpage.

and do that every time we execute a simple `git push` to the `main` branch! First things first, let's get our `C:/Hugo/Sites/yourdomain.com` directory on Github. Create a new repository on github called `yourdomain.com`, where obviously you fill in the name of your own domain. This repository **needs to be public**, because Github actions are only available for public (or Enterprise) repositories. 

To connect your local directory with your remote Github repository, you can use

```git
cd 'C:\Hugo\Sites\yourdomain.com'
git init
git remote add origin https://github.com/your-username/yourdomain.com
git pull origin main
```

where again, you should replace `your-username` and `yourdomain.com` with your own values. At this point I would recommended creating a `.gitignore` file containing `public/*` in your document root (`/yourdomain.com/.gitignore`), to prevent it from being unnecessarily pushed to GitHub. 

To set-up GitHub actions, we are going to create a new folder `/.github` with the file `main.yaml` inside, which contains instructions for GitHub to build and upload our website. 

```
--- yourdomain.com/
    |-- .github/
    |   |-- main.yaml 
    |--- ...
```

Inside of this file, copy the following code: 

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
The `.yaml` file is pretty self-explanatory. The first part essentially tells GitHub to perform the actions in this `.yaml` file whenever we push something to the branch `main`. The second part tells it to obtain an environment which meets our needs for building a `hugo` website. The last part builds our website, and deploys it to our $web blob. 

Something that took me some time to understand was the syntax `uses:.../...`. This essentially points to a piece of code on Github, and uses it for our GitHub action. For example, the `uses: peaceiris/actions-hugo@v2` essentially points to a specific version of https://github.com/peaceiris/actions-hugo to be used within this Github workflow. 

## 3.2 Authorizing Github to update our Azure Blob

![Access Keys](/static/static-webpage/access-keys.png)

Now that we have our set of deployment commands, all that is left is to actually run the workflow! For that we need to make sure GitHub has the right credentials to connect to Azure. In the Azure Portal, go back to our storage account, and find `Access keys` under `Security + networking`. Click on the `Show keys` button, and copy paste either of the `Connection string` fields. Don't share this key with anyone else, as it grants read+write access to your storage blob and hence the content of your website!

![Github Environment Secrets](/static/static-webpage/github-environment.png)

We need to add this connection string to our GitHub repository. In your browser, go to your GitHub repository and locate the Settings. Under `Environments`, we are going to create a `New environment`, named `build-environment`[^6]. Here, press the `+ Add Secret` button. Name it `BLOB_STORAGE_CONNECTION_STRING`[^6] and copy-paste the connection string we obtain from the Azure portal in the `Value` field. That's it!  

[^6]: These names are taken from the `main.yaml` file above! If you want to use different names, make sure to change them in your `main.yaml` as well.

## 3.3 Deploying to Azure Blob with GitHub

With this work done, we can finally deploy our website using Github! Enter your standard git entries

```git
git add .
git commit -m "First deployment!"
git push
```

and watch the magic happen in the `Actions` tab of your GitHub page. After the build has been completed, you should also see that files have been added to the `$web` blob in your Azure Portal. Go to your CDN Endpoint URL to view your website live!

# 4. Setting up a custom domain on Azure CDN {#customdomain}
We now essentially have our website up and running on the CDN. Naturally, we don't want to use some ugly hostname like `yourendopoint.azureedge.net`, but would much rather have our visitors use an address like `yourdomain.com`! Obviously, you first need to buy a domain to perform this step. Websites like godaddy.com or cloudflare.com can provide these.  

## 3.1 Adding the www subdomain to Azure CDN
The easiest custom domain to add is a subdomain like `www.yourdomain.com`. To do this, we have to edit your DNS settings accordingly. At your newly created CDN endpoint page on the Azure Portal, copy the `Endpoint hostname` at the top-right. Go to your DNS provider (godaddy.com, cloudflare.com) and add a CNAME record pointing to your `Endpoint hostname`

| NAME | TTL | TYPE | VALUE |
|---|---|---|---|
| www | 5min | CNAME | yourendpoint.azureedge.net |

This connects `www.yourdomain.com` to your storage blob through the CDN. Thats it! We need to wait for your DNS provider to push your changes to the registrar, and for the changes to propagate through the network. You can look-up the CNAME records using [this tool](https://mxtoolbox.com/DNSLookup.aspx) to check if the changes have been implemented. Lookup the DNS records for `www.yourdomain.com` to do so. If this is successful, we can set things up on the Azure side of things.

- Go to your CDN endpoint in the Azure Portal (`Security + networking` -> `Azure CDN` -> `Endpoints`) 
- Select your CDN endpoint in the list. 
- Click on `+ Custom Domain` and fill in `www.yourdomain.com` as your `Custom hostname`.
- Press `Add`.

## 3.1 Setting up SSL certificate for HTTPS
Adding a SSL certificate to your custom subdomain is very simple! Simply click on the custom domain for your CDN endpoint, and toggle `Custom domain HTTPS` to `On` and press `Save`. That's it. Verifying the domain can take quite some time, so hang tight. With that, your website is now live on `https://www.yourdomain.com`!

## 3.2 Using Redirect Engine to Enforce HTTPS

![enforce https](/static/static-webpage/enforce-https.png)

Now that we have an SSL certificate for `www.yourdomain.com` we want all HTTP traffic to use HTTPS instead. This can be easily implemented by your CDN endpoint's `Redirect engine`, which you can find under `Settings`. 
- Click `+ Add rule`.
- `+ Add condition`: `If Request protocol` `Equals` `HTTP`
- `+ Add action`: `Permanent redirect (308)` `HTTPS` and leave the rest open
- Press `Save`

## 3.3 Linking your apex domain to the CDN
*Now the hard part.* Apparently connecting a subdomain (e.g. `www.yourdomain.com`) to your CDN endpoint is significantly easier to do as opposed to adding your root or apex domain (e.g. yourdomain.com)[^apexdomains]. Especially if you want to add an SSL certificate for HTTPS access. The sad part is obviously that nobody ever uses the `www.` prefix anymore, and `yourdomain.com` will in this case lead them to an error page. 

[^apexdomains]: Here is a [GitHub Issue](https://github.com/MicrosoftDocs/azure-docs/issues/63977) from 2020 pointing this out.

I've tried a number of options[^otheroptions], but found that a combination of (temporarily) using Azure DNS and creating my own SSL certificate using `certbot` was, sadly, the easiest way. Let's start with adding the apex/root domain `yourdomain.com` to our CDN endpoint. In principle, the Azure documentation, as well as several tutorials on the web, state that adding the following records to your DNS settings should do the trick

[^otheroptions]: I've tried creating ALIAS or ANAME records to point towards my CDN Endpoint, as well as to `www.chunheungwong.com`, both of which did not resolve the hostname correctly. I tried adding the IP address of my [CDN endpoint as an A Record](https://www.xyb.name/2020/07/10/enable-https-and-root-domain-on-azure-cdn/). I've tried using the Redirect Engine in the Azure CDN settings to [redirect traffic](https://docs.microsoft.com/en-us/answers/questions/34737/how-to-point-your-dns-zone-apex-root-naked-domain.html) from `yourdomain.com` to `www.yourdomain.com`, but even though [Redirect Checker](https://www.redirect-checker.org/) and [DNS Lookup tool](https://mxtoolbox.com/DNSLookup.aspx) said I was properly configured, I could not connect to my static website. There are paid services that integrate with Azure which provided automatically renewed certificates directly from the Azure Portal. However, at ~€15,-/month the certificate would be almost 150-1500x more expensive than the hosting the website itself. 

| NAME | TTL | TYPE | VALUE |
|---|---|---|---|
| @ | 5min | ALIAS | yourcdnendpoint.azureedge.net |
| cdnverify | 5min | CNAME | yourcdnendpoint.azureedge.net |

These records essentially tell your DNS to point `yourdomain.com` to `yourcdnendpoint.azureedge.net`, which is exactly what we want. The `cdnverify` `CNAME`-record supposedly allows Azure to confirm that indeed your domain is yours and should be allowed to point to your CDN endpoint.  If this works, great! You can move onto the next section on adding an SSL certificate to `yourdomain.com`. If you are less lucky, you might also find that whatever DNS settings you try on your DNS provider's settings, you will not be allowed to add your root domain.

![DNS zone](/static/static-webpage/dnszone.png)

To solve this issue, I found that I was forced to use Azure's DNS services[^azuredns]. Don't worry, we can delete them after and go back to the DNS provider of our choice! In your Azure Portal, search for `DNS zones`, and press `+ Create`. Select the resource group you placed your Storage blobs in, and fill in `yourdomain.com` and create the DNS zone. 

[^azuredns]: I tried a whole host of different settings. [Adding the Endpoint IP as an A-name record](https://www.xyb.name/2020/07/10/enable-https-and-root-domain-on-azure-cdn/), [Using the ]

![DNS record](/static/static-webpage/dnsrecord.png)

At your Azure Portal homescreen you will now find your DNS zone `yourdomain.com`. When you click on it, you will be greeted with the familiar table of DNS records. 
- Click the `+ Record set` button at the top. 
- Select `A - Alias record to IPv4 address` type.
- Toggle `Alias record set` to `yes`. 
- Choose your CDN endpoint in the `Azure resource` dropdown.
- Set the `TTL unit` to `minutes`. 
- Press `OK`.

![DNS record](/static/static-webpage/cnamerecord.png)

For the second record we need to add a CNAME record use for verification by Azure
- Click the `+ Record set` button at the top. 
- Select `CNAME ...` type.
- Toggle `Alias record set` to `No`. 
- Choose your CDN endpoint in the `Azure resource` dropdown.
- Set the `TTL unit` to `minutes`. 
- Press `OK`.

With those settings completed, we now need to tell your DNS provider to use the Azure DNS instead. You can find the addresses of the four Azure DNS `nameservers` (ns) at the top right of your DNS zone. Navigate to your domain's settings on your DNS providers webpage, and copy these addresses into the `nameserver` fields. 

With this finished, we can finally add our apex domain to our CDN endpoint. Navigate back to your CDN endpoint on Azure and go to `Custom domains` under `Settings`. Press `+ Custom domain` and fill in `yourdomain.com`. It could take a few minutes for the DNS record changes to propagate. 

After this is finished, you can go ahead and delete the Azure DNS zone. Just don't forget to reset the nameservers of your domain at your DNS provider! If you want to continue to use the Azure DNS Zone, copy the existing DNS records from your original DNS provider. You should now be able to access your website using `http://yourdomain.com`

## 3.4 Adding a custom SSL certificate to you apex domain
Sadly, adding an SSL certificate to our apex domain `yourdomain.com` in Azure is disabled for a reason that is beyond my comprehension. Luckily, there are quite a few SSL certification methods. In this tutorial, we will be using creating a free SSL certificate using [certbot](https://certbot.eff.org/pages/about), an open source tool. These certificates are signed by [Let's Encrypt](https://letsencrypt.org/), a non-profit Certificate Authority who are apparently just interested in making the internet a safer place. To do this, you will need to have access to a Linux machine. On Windows, you can install a Linux Virtual machine using [VMWare](https://www.vmware.com/products/workstation-player.html). I would recommend using [Ubuntu](https://ubuntu.com/download/desktop) as your firmware. 

In your linux system, start a terminal and enter the following commands with the domain of your choice:

```bash
sudo apt update
sudo apt install certbot
sudo certbot certonly -d yourdomain.com --manual --preferred-challenges dns
```

![certbot](/static/static-webpage/certbot.png)

This will install `certbot` and start the certification process for `yourdomain.com`. You will need to answer a few questions. Finally, it asks you to create a new `TXT` record for your domain with a given passphrase to validate your domain (see image). **Do not press enter before we're sure this record is updated!** Go to your DNS provider (godaddy.com, cloudflare.com, Azure DNS) and create a new `TXT` record:

| NAME | TTL | TYPE | VALUE |
|---|---|---|---|
| _acme-challenge | 5min | TXT | your_passphrase |

We can use the [MX Toolbox](https://mxtoolbox.com/SuperTool.aspx?action=txt%3ayourdomain&run=toolpage) to perform a `TXT Lookup` and check if our TXT record has indeed been updated. It could take up to 5min for the record to update. If all went well, it should give you the TXT record you just entered with green checkmarks indicating `DNS Record Published`. 

In your terminal, press enter to receive the SSL certificate for `yourdomain.com`, which comprises a private and a public key. To get it into a format Azure understands, we need to merge these files into a `.pfx` file before uploading it to Azure. 

```bash
sudo openssl pkcs12 -export -out yourdomain.com.pfx -inkey /etc/letsencrypt/live/yourdomain.com/privkey.pem -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

Seeing as you are exporting your certificate, you are asked to create a password. You will need to use this password again when we import this certificate in Azure later. 

If you are using a VM, you can simply drag + drop the file from your VM to your main computer. You might need to change the ownership of the file to do this, as the certificate was made by `root`

```bash 
sudo chown <yourusername>:<yourusername> yourdomain.com.pfx
```

![register app](/static/static-webpage/azurepowershell.png)

Back at the Azure Portal, we need to [Register Azure CDN](https://docs.microsoft.com/en-us/azure/cdn/cdn-custom-ssl?tabs=option-2-enable-https-with-your-own-certificate) as an app in your Azure Active Directory. Find the `Cloud Shell` button in the top bar, and make sure your are using `PowerShell` (see image). Once the terminal is loaded up, type in 

```powershell
New-AzADServicePrincipal -ApplicationId "205478c0-bd83-4e1b-a9d6-db63a3e1e1c8"
```

The seemingly random garble at `ApplicationID` is apparently the unique identifier for the CDN. You can close the terminal after this.

![create key vault](/static/static-webpage/keyvault.png)

Next, we need to set-up an Azure Key Vault and grant it access to our CDN Endpoint. This way, our CDN endpoint can use certificates we store in the vault. 
- In the search bar at the top, search for `Key Vault`. 
- Press the `+ Create` button to create a new vault. 
- Choose the `Resource group` which contains your static website. 
- Fill in a recognizable name for you key vault (e.g. `sslcertificates`). 
- Choose a region close to you, and press `Next: Access policy` 

![access policy](/static/static-webpage/access-policy-settings.png)

Here, we need to give the correct persmissions to our CDN. 
- In `Secret permissions` check `Get` and `List`. 
- In `Certificate permissions` check `Get` and `List`. 
- In `Select principal`, search for `microsoft.azure` and select `Microsoft.AzureFrontDoor-Cdn`. This name seems to change, so just select the one containing `cdn`.
- Click `Add` and finish up the Key Vault creation.

![add certificate](/static/static-webpage/certificates.png)

Navigate to your newly created Key Vault, and look for `Certificates` under `Settings`. 
- Click on `+ Generate/Import`.
- Set `Method of Certificate Creation` to `Import`.
- Make a recognizable `Certificate Name` (e.g. `yourdomainssl`)
- Upload your `yourdomain.pfx` file.
- Press `Create`.

![custom certificate](/static/static-webpage/customcertificate.png)

With our certificate and access rights in place, go to your CDN endpoint and click on the apex domain `yourdomain.com` you added. 
- Toggle `Custom domain HTTPS` to `On`
- Select `Use my own certificate` under `Certificate management type`
- Select the `Key Vault` you just made
- Select the SSL certificate you just added
- Set the `Certificate/Secret version` to latest
- Press `Save`.

After waiting for the HTTPS certificate to validated, your website will be available at `https://yourdomain.com`! 

# 3.5 Redirect traffic from www to apex domain 

![Redirect WWW](/static/static-webpage/redirectwww.png)

Now that we have both `www.yourdomain.com` and `yourdomain.com` set-up to access our CDN endpoint, we can redirect all traffic to your apex domain to prevent any potential link-breaking. Go to the `Rules engine` under your the `Settings` in your CDN Endpoint. 

- Press `+ Add rule` and create a rule named `RedirectWWW`. 
- `+ Add condition`: `Request URL` `Begins with` `https://www.yourdomain.com` `No transform`.
- `+ Add action`: `URL Redirect` `Permanent redirect (308)` `HTTPS` `yourdomain.com` and leave the rest empty.
- Press `Save`.

Use the [Redirect Checker](https://www.redirect-checker.org/) to see if this was properly set-up. Done!

# Conclusion

I hope this tutorial was useful for you. It is an excessively verbose tutorial, which is something that I would have liked to have when I dove into this for the first time a few weeks ago. I hope it helps someone get through all the basic ideas relatively painlessly. 

Cheers,


Chun



