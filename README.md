# Science Innovators Visualization Project

This repo contains at data, preprocessing and helper scripts, proof of concept d3.js pages, and our visualization. 

We're building a visualization that explores factors that impact life expectancy and population.

### Opening these files in Chrome
To prevent cross-site scripting attacks, Chrome won't let scripts load data from a server with a different origin.
To set up a local server in Windows, I navigate (from the command line) to the directory of interest and enter

``` ~/csc595_final_project>python -m http.server 8888 &. ```

and then in Chrome, I enter "localhost:8888" as the URL. 

### Data Sources
* [World Health Organization Cause Specific Mortality Data](http://www.who.int/healthinfo/statistics/mortality_rawdata/en/)
* [World Bank Population Estimates](https://data.worldbank.org/data-catalog/population-projection-tables)
* [Natural Earth World GeoJSON file](http://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-land/)

### Reference Examples
* [Lukas Vonlanthen's D3 Map Tutorial](http://data-map-d3.readthedocs.io/en/latest/index.html): This provided a framework for our visualization and showed an implementation for many of features necessary to bring the data to life.
* [Milke Bostock's Legend Example](https://bl.ocks.org/mbostock/4573883)
* [Mike Bostock's Zoom to Bounding Box](https://bl.ocks.org/mbostock/4699541)
* [Making a bl.ock (Emma Saunders)](https://bl.ocks.org/emmasaunders/2ac8e418958f4c681f229f82729c9647)

