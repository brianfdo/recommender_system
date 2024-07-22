# Music Recommender System
## Overview
This project is a full-stack web application that provides personalized music recommendations based on users' Spotify listening data. It leverages the Spotify API to fetch user data, utilizes a custom machine learning model to generate recommendations, and presents the information through a responsive UI built with React.

### Project Components
#### Frontend
**React:** Utilized for building a dynamic and responsive user interface. \
**React Bootstrap:** Used for consistent and sleek UI components. \
**Axios:** Employed for making HTTP requests to the backend server. \
**React Router:** Implemented for navigation between different components. 

##### User Interface
**Login Page:** Users authenticate via Spotify OAuth to grant the application access to their listening data.

![alt text](https://github.com/brianfdo/recommender_system/blob/main/images/home.png?raw=true)

**Home Page:** Shows recommended tracks curated by Spotify with options to play previews.

![alt text](https://github.com/brianfdo/recommender_system/blob/main/images/recommendations.png?raw=true)

**Explore Page:** Shows recommended tracks based on the custom content-based filtering model with options to play previews.

![alt text](https://github.com/brianfdo/recommender_system/blob/main/images/personalmodelrecs.png?raw=true)

**Stats Page:** Visualizes user listening habits and audio features of their top tracks using Plotly for interactive charts. Displays top artists, top tracks, and top genres retrieved from Spotify user data.

![alt text](https://github.com/brianfdo/recommender_system/blob/main/images/statistics.png?raw=true)

#### Backend
**Node.js & Express:** Serve as the primary backend framework for handling requests and routing.\
**Flask:** Runs the custom machine learning model for generating music recommendations.\
**Spotify Web API:** Used to fetch user data, including top tracks and artists.\
**Axios:** Used within the backend to make API requests.

#### Machine Learning
**pandas & numpy:** Libraries used for data manipulation and EDA.\
**scikit-learn:** Used for creating and training the recommendation model.\
**Flask:** Serves the custom model prediction API endpoint.\
Initial EDA and model development can be viewed here: https://github.com/brianfdo/recommender-system-notebook

### Recommendations
#### Collaberative Filtering Recommendation System
**Spotify API:** User recommendations curated by Spotify are made available through the Spotify API. Recommended tracks are pulled directly from the Spotify database

Collaborative Filtering is a recommendation technique that relies on the collective behavior and preferences of users to generate recommendations. This method assumes that Spotify users who have agreed in the past on their preferences will continue to agree in the future. Collaborative filtering can be user-based, where recommendations are made based on the preferences of similar users. Additionally, it can also be item-based, where items similar to those a user has liked in the past are recommended. While this technique can offer diverse and personalized suggestions, it often requires a significant amount of user data to be effective. Recommnedations from this technique are made avaiable to us by leveraging the Spotify API.


#### Content-Based Filtering Recommendation System
**Custom ML Model:** A KMeans algorithm using the cosine similarity distance metric processes the user's top tracks into vectors to generate recommendations. Recommended tracks are pulled from small-scale datasets found online.\
**Features:** valence, year, acousticness, danceability, duration_ms, energy, instrumentalness, key, liveness, loudness, mode, popularity, speechiness, and tempo\
**Integration:** The model is integrated into a Flask server that interacts with the Node.js backend to provide real-time recommendations.

Content-based filtering, on the other hand, recommends items by comparing the features of items within a user’s profile. This method analyzes item attributes to find similarities and suggest items that match the user's taste. For instance, if a user has shown interest in high tempo EDM music featuring a specific artist, the system will recommend high tempo songs with similar artists. Content-based filtering can recommend any item as long as there is available metadata. Given the limited data used to train our ML model, resulitng predictions may consist of songs with similar musical features from various genres. 


## Challenges and Solutions
**API Rate Limits**\
Challenge: Handling rate limits imposed by the Spotify API.\
Solution: Implemented efficient data fetching and caching strategies to minimize the number of API calls.

**Token Expiry**\
Challenge: Managing OAuth token expiry and refresh.\
Solution: Developed a robust token management system that refreshes tokens as needed to ensure continuous access.

**Data Processing**\
Challenge: Processing large amounts of user data efficiently.\
Solution: Leveraged pandas for efficient data manipulation and implemented optimized data processing pipelines.

**Integration**\
Challenge: Integrating the Flask server with the Node.js backend.\
Solution: Used Axios for seamless communication between the Node.js backend and Flask server, ensuring smooth data flow and integration.

If you are an active Spotify user and would like to try this out, please email me at brianfdo3@gmail.com so that I can extend API access to your account!
