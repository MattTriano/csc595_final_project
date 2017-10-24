# Science Innovators Visualization Project

This repo contains at data, preprocessing and helper scripts, proof of concept d3.js pages, and our visualization. 

We're building a visualization that explores factors that impact life expectancy and population.

### Opening these files in Chrome
To prevent cross-site scripting attacks, Chrome won't let scripts load data from a server with a different origin.
To set up a local server in Windows, I navigate (from the command line) to the directory of interest and enter

``` ~/csc595_final_project>python -m http.server 8888 &. ```

and then in Chrome, I enter "localhost:8888" as the URL. 
