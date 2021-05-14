# Sizing Up the Pandemic - Dominic Abate, Andrei Iosifescu, Cordell Michaud

## Overview
![Teaser Image](/images/thumbnail.png)

Our visualization allows the user to view recent and historical COVID-19 data in the Untied States. The user can view visualized data concerning new cases, total cases, and deaths in all 50 states from March, 2020 to November 2020, with the selected dataset of the three being chosen by clicking the Dataset radio buttons. The user can also view state data unadjusted or adjusted per 1000 people by clicking the Dataset Adjsutment radio buttons. The 4-dimensional buble chart overlaid over a map chart displaying the United States and tied to a date slider allows the user to see where spikes and patterns occur throughout the United States over time. A linked line chart plots the full data over time for a selected state and compares it to the national average. A linked circle chart visualizes the percentage contribution of the selected state to the national COVID-19 data and is linked to the date slider at the top.

## Data description
- U.S. COVID-19 Data by State: [The COVID Tracking Project](https://covidtracking.com/data/download)
  - The dataset is a multidimensional table with 2 keys, the date (ordinal) and the state name (categorical), with associated entries for the attributes: new cases (quantitative ordered), total cases (quantitative ordered), and deaths (quantitative ordered). The dataset includes an entry for each pair of dates and states, with date keys for every week from March 15, 2020 to November 15, 2020.
  - We filtered the data to only include entries recorded for dates between March 15, 2020 and November 15, 2020. We also excluded non-state territories from the data. In addition, we combined daily data entries into weekly bins starting on Mondays by summing daily new cases, summing daily deaths, and computing the mean of daily total cases during each week. Further, we filtered the data to only include the date, new cases, total cases, and deaths columns, and filled in missing data entries with zeroes. Lastly, we computed adjusted versions of values for each data entry that were adjusted to state population out of 1000.
- U.S. State Boundary Data: [Converted from United States Census Bureau Data](https://eric.clst.org/tech/usgeojson/)
  - The dataset is spatial geometry defining U.S. state boundaries. The dataset includes a set of boundary information for each of the 50 states.
  - We filtered the dataset to only include boundaries U.S. states and exclude non-state territories.
- U.S. 2019 Population Data by State: [United States Department of Agriculture Economic Research Service](https://data.ers.usda.gov/reports.aspx?ID=17827)
  - The dataset is a table with 1 key, the state name (categorical), with associated entries for the population (quantitative) attribute. The dataset includes an entry for each of the 50 states for the year 2019.
  - We filtered the dataset to only include the name and abbreviation of each state and its associated 2019 population data.

## Goals and Tasks
- Annotate features: Users can click on a state on the bubble map chart to annotate the point with its current value.
- Present Trends: Users can click on states to display the trend of data values for that state over the entire range of time for the recorded data.
- Discover outliers: Users can discover outliers in the data by scrubbing through the date slider timeline and using the color and size of the circle mark corresponding to each state. 
- Compare trends: Users can compare the trend of data values for the selected state compared to the rest of the country using the line chart and with the combination of the date slider and bubble map chart.
- Identify features: Users can click on a state to display its name and current daata values for the selected date.
- Lookup outliers: Users can find outliers for each state by selecting the state and using the date slider to find large differences in data values on the line chart and bubble map chart.

## Idioms
The domain of this project is the general population. The task of the user is to compare total cases, new cases, and deaths between different states in the US.
The three visualizations allow the user to compare the selected attribute with other states, the US as a whole, and with the selected states history.

4-dimensional bubble map chart:
  - The encodings for this chart include X and Y position for the state's location, bubble size representing the value for the selected metric for each state, and bubble
color representing the value for the selected metric per 1000 people in that state. 
  - The chart will show a border around the state and present a tooltip with the state name and data recorded for the time period selected on mouse hover.

![Bubble Map Chart](/images/bubblemapchart.PNG)

Line chart:
  - The encodings for this chart include X position representing the date throughout the dataset and Y position representing the value of the selected metric throughout the dataset. A vertical line represents the currently selected time frame for the other charts.

![Line Chart](/images/linechart.PNG)

Circle chart:
  - The encodings for this chart include area representing the percentage of the selected state's value for the selected attribute compared to the average of values across all states. Color represents the state selected, and the US average.
  - The chart displays a tooltip showing the percentage of the selected state's value for the selected attribute and the average of values across all states.

![Circle Chart](/images/circlechart.PNG)

The line chart and circle chart will be presented when a state is clicked. The marks of all charts will update when a new time frame is selected.

An algorithm was necessary to create the sum and average values of the selected attribute across all states and calculate the value of the selected attribute for 1000 people in each state.

## Reflection
The initial proposal was solid, it laid out the basic layout and general concepts which would make up the final product and what we were trying to show. There were some issues with the proposal, such as not enough unique vizualtions in the project, and that smaller states would be obscured by bigger states. The WIP proposed solutions to these concerns but did not yet implement them. Our WIP consisted of the initial layout which we improved upon from the proposal, to increase readibility and flow of our visualization. The new visualization we proposed to add to the project was a circle-chart showing the selected states impact relative to the US as a whole. The WIP did not have any functionalities actually encoded yet, so we did not meet any issues. Transitioning from the WIP to the final product involved the most change to the goals from the previous transitions. Our original proposal for all the included functionalities proved realistic in almost all aspects. The only aspect which proved not to be realistic was scaling individual states' size according to the appropriate information metric. This turned out to be more difficult then initialy thought and we came to the conclusion that it was doable but it would look messy. So we opted in favor of adding circles on top of each state depicting the metric in size of the circle and saturation of the circle. This proved out to be challenging, but it was achieveable.A function to calculate the centroids of state boundaries data file was created to help place the circles at the center of each state. This actually proved to look better than scaling the states themselves as originally agreed. Aside from that we were able to implement all the features and functionalities proposed. One thing we would have liked to do differently is the time distributions for all the tasks. Plotting the spatial data and the functions regarding it were more time-consuming then originally thought, whereas the other visualizations were more straighforward and faster to implement.  

## Team workload
- Cordell Michaud: Worked on preprocessing data, layout and styling, and the bubble map chart.
- Dom Abate: Implemented line chart functionality.
- Andrei Iosifescu: Implemented circle chart functionality, as well as tool-tip functionality for circle chart and map chart.

