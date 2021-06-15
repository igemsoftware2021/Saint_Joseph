# iGEM Wiki Test Server
This tool allows you to develop and test locally your wiki with template system of iGEM.

## Requirements
- Node

## Usage

### Installation
First of all download the reporistry to your computer. Run `npm install` or `yarn install` at the root of the project.
Go to `.env` and change the `TEAM_NAME` to your team's name and `WIKI_DIR` to the root of your wiki.
<br>
Run `npm run build` or `yarn build` to compile the project.

### Running
Finally run `npm start` or `yarn start` at the root and it will print out the website URL.

#### Directory Structure
For this example let's say this is your wiki folder
```
╔📂 Your Wiki Folder
║
╠═╦═ 📂 Templates
║ ║
║ ╚═══ 📄 Test.html
║
╠═══ 📄 Landing.html (This is where /Team:TEAM_NAME leads to)
║
╚═══ 📄 Team.html (This is where /Team:TEAM_NAME/Team leads to)
```

#### Using templates

```html
<!-- Templates/Test.html -->
<html>
     <body>
          <div>
               <h1>Hello World!</h1>
               <h1>Hi!</h1>
               <!-- You can also use other templates inside other templates -->
          </div>
     </body>
</html>

<!-- Team.html -->
<html>
     <body>
          <h1>Hello iGEM!</h1>
          {{ Template/Test }}
     </body>
</html>
```
<br>
And the result would look like

```html
<html>
     <body>
          <h1>Hello iGEM!</h1>
          <div>
               <h1>Hello World!</h1>
               <h1>Hi!</h1>
               <!-- You can also use other templates inside other templates -->
          </div>
     </body>
</html>
```

### Disclaimer
The results may vary from iGEM's original system. Especially the image names, please review before uploading it to iGEM servers.