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

This is a complete guide on how I made this website. What makes this webpage "special", is that it's a [static webpage](https://www.sanity.io/what-is-a-static-site). No server needed, no fancy routing needed, just some static files hosted on a filehosting service. This tutorial is aimed meant for people who have never made a static webpage before, because that was me before I made this post. 

For reference, you can find the files I used to build this website on my [Github Page](https://github.com/CH-Wong/chunheungwong.com). 


# Contents
I will start with showing how you can build a simple website with relative ease with just text files styled in Markdown (.md) using a package called [Hugo](https://gohugo.io/). Afterwards, I will show you how to host these files on [Azure Storage Containers](https://azure.microsoft.com/nl-nl/services/storage/blobs/). I will then guide you through setting up your custom domain-name for your container, as well as adding an SSL certificate for HTTPS, and ultimately delivering your website through the [Azure Content-delivery Network (CDN)](https://azure.microsoft.com/nl-nl/services/cdn/). Lastly, I will walk you through automated deployment of your webpage using Github actions. In short, we will cover:

1. [Creating a static webpage with Hugo](#hugo)
2. [Setting up Azure Blob/Container](#settingupblob)
3. [Setting up a custom domain](#customdomain)
4. [Setting up deployment through Github actions](#githubdeployment)

# 1. Creating a static webpage with Hugo {#hugo}
This website is created using [Hugo](https://gohugo.io/), a standalone package that transforms [Markdown (.md)](https://www.markdownguide.org/basic-syntax/) text files to html/css. Their [Quickstart page](https://gohugo.io/getting-started/quick-start/) is quite self-explanatory, but for the sake of completeness I will post my own learning process here as well.

## 1.1 Installing Hugo
On **Linux**, you can quite simply install Hugo using your favorite package manager. E.g. for Ubuntu 

```bash
apt install hugo
```

For **Windows**, you need to download the latest Hugo distribution from their [Github page](https://github.com/gohugoio/hugo/releases). The `hugo_x.xx.x_Windows-64bit.zip` contains an executable `hugo.exe`and some other files, which we will need to make a home for. It is recommended to create a new folder `C:\Hugo\bin`. In `Powershell` use:

```powershell
mkdir 'C:\Hugo\bin'
```

Unzip the contents of the .zip file in `C:\Hugo\bin`. We need to add this folder to our system environment `Path` such that Windows can find `hugo.exe` inside. 

```powershell
$env:Path += ';C:\Hugo\bin'
```
Finally, we are also making a folder in for our websites to be created later!

```powershell
mkdir 'C:\Hugo\Sites'
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
which at this point are mostly empty folder. Don't worry, we will be adding things there soon! `hugo` can now translate this scaffolding into an `html/css`-based website. For testing purposes, you can locally host it on your machine if you enter

```powershell
hugo server -D
```

where the `-D` option is shorthand for `--buildDrafts` which includes draft posts on your test server. Your website is running! In your webbrowser, go to `localhost:1313` to view your website!

## 1.3 Adding content
At this point, your webpage is obviously very empty. Let's add our first piece of content! `hugo` can help you with creating files/folders for new content. For example, to create a your first posts into the new category `posts`, simply type

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
You can also do these actions manually, no problem! You might have noticed that your webpage at `localhost:1313` has automatically rebuilt and now has your new (empty) post! Let's fill that post with some content content. If you open `my-first-post.md` in your IDE, you will find a barebones file:
```md
---
title: "Post"
date: 2021-12-02T20:37:47+01:00
draft: true
---
``` 

To add content to the post, you simply type  in [Markdown format](https://www.markdownguide.org/basic-syntax/), which will then be translated to html/css by hugo. Try adding this example text to the .md file:

```md
# Hello this is my level 1 Heading
You can do all sorts of formatting, like **bold-face** or *italics*, or `in-line codeblocks`. 

## This is my level 2 heading. I like dogs!
You can add an image using this notation:

![Floofy Dog](https://images.unsplash.com/photo-1530281700549-e82e7bf110d6)
```


After saving the file, the server should automatically rebuild the website with your changes. 

## 1.4 Adding a theme
To spice up your webpage, we can add pre-built themes. A selection of themes is available on the hugo website https://themes.gohugo.io/. For this page, I used the [terminal theme](https://themes.gohugo.io/themes/hugo-theme-terminal/). 

Let's try to add a different one; the [novela theme](https://themes.gohugo.io/themes/hugo-theme-novela/) for example. Click on the link and press `Download`. You might be just as suprised as I was to find a [GitHub repository](https://github.com/forestryio/hugo-theme-novela)! If you think about it, sharing themes through GitHub is ofcourse a fantastic method have a version-controlled distribution. 

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
Your website should now be stylized using the `novela` theme! Most themes also allow for easy configuration of pre-defined settings using the `config.toml` file. The syntax for these configurations can usually be found on the theme's Github repository. For the `novela` theme, we find:


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

Which allows easy set-up for your social accounts.


[^1]: **Directly cloning themes (simple)** is the simplest to understand, as you basicaly copy all the files you need into your directory. You can edit the theme files if you need to tweak some parts, and delete them when they are no longer necessary. 

[^2]: **Adding theme as submodule (recommended)** Allows it to be tracked separately from your main git repository. This could be nice for separate version control, whilst still maintaining the ease of editing and creating new files.

[^3]: **Using Hugo Mods (for cool kids)** for themes allows you to build you website without ever having to pull the directory. This is cool because theres less files in general and seems to simplify selecting versions and other things. However, I think it's quite complicated to make quick edits to the theme, and extra import statements are required later on when we deploy automate the deployment of this website through Github Actions.



## 1.5 Archetypes
Most themes will also have so-called `archetypes`, which is just a fancy word for `template`. If you navigate to `/themes/hugo-theme-novela/archetypes` you will find the `default.md` file containing:

```markdown
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
hero: /images/hero-3.jpg
excerpt:
draft: true
---
```

This means that every time you create a new content page, this will be added at the top. Try running the command below and see for yourself!
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
Write some pre-amble, and run the following command to see the results:

```powershell
hugo new posts/post-with-custom-template.md
```

## 1.6 Shortcodes
To do more than just text and images, hugo has added some [shortcodes](https://gohugo.io/content-management/shortcodes/) for frequently used objects. Short code are `html`-like expression which are put between double accolades`{{}}`. To embed a tweet for example you can quite simply add this[^4]

```markdown
<!-- Insert this expression into double accolades {{}} -->
<tweet user="SanDiegoZoo" id="1453110110599868418">
``` 
where you pass the `username` and `tweet ID` to the shortcode. 
[^4]: I can't actually show the correct code with {{}}, because my Markdown thinks its a shortcode and will render the shortcode instead! [This link](https://www.getzola.org/documentation/content/shortcodes/#shortcodes-without-body) was the closest I got to a solution, but alas...


Personally, I have the need to add mathematical equations. With the help of [Codecogs](https://www.codecogs.com/latex/eqneditor.php) I can convert LaTeX code to images and embed them. I wrote a custom shortcode in `layouts/shortcodes/equation.html`

```html
{{ if .Get "src" }}
<image src="https://latex.codecogs.com/gif.latex?{{ .Get "src" | safeURL }}" class="{{ with .Get "position"}}{{ . }}{{ else -}} left {{- end }}" alt="LaTeX Equation" style="border-radius: 2px; background-color:white; padding: 5px">
</image>
{{ end }}
```
The `{{ .Get "src" | safeURL }}` part essentially puts whatever I put in as the `src` variable into my `https` request to codecogs given that its a safeURL. For example:

```md
<!-- Insert this expression into double accolades {{}} -->
`<equation src="f(\phi)=e^{i\phi t}">"`
```
{{<equation src="f(\phi)=e^{i\phi t}">}}

```md
<!-- Insert this expression into double accolades {{}} -->
`<equation src="H=P_\theta \dot{\theta}+P_\phi \dot{\phi}-L" position="center">`
```
{{<equation src="H=P_\theta \dot{\theta}+P_\phi \dot{\phi}-L" position="center">}}

I think that's pretty cool! In the next part, we will be checking out how to create an Azure Storage Container to host our files in.

# 2. Creating an Azure Storage Container for our Static Webpage {#settingupblob}
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

# 2.3. Setting up a custom domain {#customdomain}
If you have a personal domain, you can redirect the traffic to that domain name to the Azure storage blob. However, depending on the location of the requester, the webpage could load quite slow. As such, it is recommended to use a [Content-delivery Network (CDN)](https://www.akamai.com/our-thinking/cdn/what-is-a-cdn)).. This is essentially a bunch of geographically separeted servers that cache our webpage to make it possible to load it faster and increase reliability.

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
Now that we have a CDN endpoint, we can have our custom domain point to it! That way, our visitors can simply go to `yourdomain.com` instead of `blablabla.web.core.windows.net`. To do that, we have to add your `Endpoint hostname` to your DNS settings. At your newly created CDN endpoint page on the Azure Portal, copy the `Endpoint hostname` at the top-right (something ending with `.azureedge.net`). Go to your DNS provider (godaddy.com, transip.nl, cloudflare.com) and add a CNAME record pointing to your `Endpoint hostname`

| NAME | TTL | TYPE | VALUE |
|---|---|---|---|
| www | 5min | CNAME | yourendpoint.azureedge.net |
| cdnverify | 5min | ALIAS | yourendpoint.azureedge.net |

These records allow Azure to validate that this domain is indeed yours and can be used to connect to the endpoint. 
The first one is to allow the subdomain `www.yourdomain.com` to access the container. The second is to enable your root or apex domain to also be added. Thats it! We need to wait for your DNS provider to update your changes to the registrar, and for the changes to propagate through the network. 

After these changes have been installed, we can now add your custom domain to your CDN endpoint. 

- Go to your CDN endpoint in the Azure Portal (`Security + networking` -> `Azure CDN` -> `Endpoints`) 
- Click on your CDN endpoint in the list. 
- Click on the `+ Custom Domain` and fill in `www.yourdomain.com` for `Custom hostname`.
- Press `Add`.

If this does not work, the DNS setting may require a bit more time to propagate. You can check this using a [DNS Lookup tool](https://mxtoolbox.com/DNSLookup.aspx), by requesting the DNS settings for `www.yourdomain.com`.

## 3.3 Setting up SSL certificate for HTTPS
Adding a SSL certificate to your custom subdomain is very simple! Simply click on the custom domain you just added to your CDN endpoint, and toggle `Custom domain HTTPS` to `On` and press `Save`. That's it. Verifying the domain can take quite some time, so hang tight!

## 3.4 Adding your apex domain with SSL certificate
Now the hard part. Apparently connecting a subdomain (e.g. `www.yourdomain.com`) to your CDN endpoint is significantly easier to do as opposed to adding your root or apex domain (e.g. yourdomain.com). Here is a [GitHub Issue](https://github.com/MicrosoftDocs/azure-docs/issues/63977) from 2020 pointing this out. The sad part is obviously that nobody ever uses the `www.` prefix anymore, and `yourdomain.com`  will in this case lead them to an error page. 

```bash
sudo apt-get update
sudo apt-get install certbot
sudo certbot certonly -d yourdomain.com --manual --preferred-challenges dns
```

## 3.4 (Optional) Setting up a Private Endpoint for your storage


# 4 Deploying our files to the Azure blob {#githubdeployment}
We are now ready to upload files to our Azure Storage Container and create our website! First we need to convert our `hugo` files into the actual `html/css` website. Navigate to the directory of your website and simply enter:

```powershell
cd "C:\Hugo\Sites\yourdomain.com
hugo
```
Yes. Just `hugo`. You will now find that a `/public/` folder was added to your files. This is our website! We want to upload this folder to our Azure container. There are many ways to do this. 
1. You can manually upload them using the Azure portal by clicking the `upload` button in your `$web` container.
2. You can install a [Virtual Studio Code (VSCode)](https://code.visualstudio.com/) add-on called [Azure Storage](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestorage) that connects to your `$web` container and uploads it for you. 
3. You can automatically build and deploy your website through GitHub.

Personally, I wanted to try using Github actions for the first time, as I have never tried automated deployment. Have to start with CI/CD somewhere right? I'll try to show you what I've learned so far.

## 4.1 Automated deployment using Github actions
What we are trying to achieve is to have Github not only for version control, but actually use Github's services to 

1. Create/get an environment (Docker) to process our files.
2. Use our `hugo` files to build our website (the `hugo` command).
2. Connect and authenticate with our Azure container.
3. Update the Azure container to match our updated webpage.

and do that every time we execute a simple `git push` to the `main` branch! First things first, let's get our `C:/Hugo/Sites/yourdomain.com` directory on Github. Create a new repository on github called `yourdomain.com`, where obviously you fill in the name of your own domain. This repository **needs to be public**, because Github actions are only available for public (or Enterprise) repositories. 

To connect your local directory with your remote Github repository, you can use

```git
cd 'C:\Hugo\Sites\yourdomain.com'
git init
git remote add origin https://github.com/your-username/yourdomain.com
git pull origin main
```

where again, you should replace `your-username` and `yourdomain.com` your own values. At this point I would recommended creating a `.gitignore` file containing `public/*` in your document root (`/yourdomain.com/.gitignore`), to prevent it from being pushed to GitHub everytime. 

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
The `.yaml` file is pretty self-explanatory. The first part essentially tells GitHub to perform these set of actions whenever we push something to the branch `main`. The second part tells it to obtain an environment which meets our needs for building a `hugo` website. The last part site, and deploys it to Azure. A thing that took me some time to undestand was the syntax `uses:.../...`. This essentially points to a piece of code on Github, and uses it for our GitHub action. For example, the `uses: peaceiris/actions-hugo@v2` essentially points to a spcific version of https://github.com/peaceiris/actions-hugo to be used within this Github workflow. 

## 4.2 Authorizing Github to update our Azure Blob

![Access Keys](/static/static-webpage/access-keys.png)

Now that we have our set of commands, all that is left is to actually run the workflow! For that we need to make sure GitHub has the right credentials to connect to Azure. In the Azure Portal, go back to our storage account, and find `Access keys` under `Security + networking`. Click on the `Show keys` button, and copy paste either of the `Connection string` fields. Don't share this key with anyone else, as it grants read+write access to your storage blob and hence the content of your website!

![Github Environment Secrets](/static/static-webpage/github-environment.png)

We need to add this connection string to our GitHub repository. In your browser, go to your GitHub repository and lcoate the Settings. Under `Environments`, we are going to create a `New environment`, named `build-environment`[^5]. Here, press the `+ Add Secret` button. Name it `BLOB_STORAGE_CONNECTION_STRING`[^5] and copy-paste the connection string we obtain from the Azure portal in the `Value` field. That's it!  

[^5]: These names are taken from the `main.yaml` file above! If you want to use different names, make sure to change them in your `main.yaml` as well.

## 4.3 Deploying to Azure Blob with GitHub

With all our work done now, we can finally deploy our website!

```git
git add .
git commit -m "First deployment!"
git push
```

and watch the magic happen in the `Actions` tab of your GitHub page! After the build has been completed, you should also see that files have been added to the `$web` container in your Azure Portal. But most importantly, your website should now be accessible on your custom domain! Open your browser and go to `www.yourdomain.com` to see the result.
It could take some time for the content to be updated in the CDN (maybe an hour).


# Conclusion

I hope this tutorial was useful for you. It is an excessively verbose tutorial, which is something that I would have liked to have when I dove into this for the first time a few weeks ago. I hope it helps someone get through all the basic ideas relatively painlessly. 

Cheers,


Chun



