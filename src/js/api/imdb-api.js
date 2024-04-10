const IMDB_API_KEY = `15150ce69b4b8fc4394b6dfaa88a912b`;
const IMDB_URL = `https://api.themoviedb.org`;
import axios from 'axios';

// API URL and KEY
export const optionsIMDB = {
  specs: {
    trendingMovie: '/3/trending/movie/day',
    searchMovie: '/3/search/movie',
    movieDetails: `/3/movie/`,
    key: IMDB_API_KEY,
    baseURL: IMDB_URL,
    page: 1,
    query: '',
    totalPages: 1,
  },
};

// Genres
const genres = [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" },
    { "id": 16, "name": "Animation" },
    { "id": 35, "name": "Comedy" },
    { "id": 80, "name": "Crime" },
    { "id": 99, "name": "Documentary" },
    { "id": 18, "name": "Drama" },
    { "id": 10751, "name": "Family" },
    { "id": 14, "name": "Fantasy" },
    { "id": 36, "name": "History" },
    { "id": 27, "name": "Horror" },
    { "id": 10402, "name": "Music" },
    { "id": 9648, "name": "Mystery" },
    { "id": 10749, "name": "Romance" },
    { "id": 878, "name": "Science Fiction" },
    { "id": 10770, "name": "TV Movie" },
    { "id": 53, "name": "Thriller" },
    { "id": 10752, "name": "War" },
    { "id": 37, "name": "Western" }
  ];

// Function to fetch trending movies
const fetchTrendingMovies = async (arg1, arg2) => {
  try {
    const response = await axios.get(arg1);
    if (!response.ok) {
      throw new Error("Failed to fetch movies.");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return []; // Return an empty array
  }
};

// Main function to fetch movies, create gallery items, render gallery,
const main = async () => {
  //API URL and KEYS for trending movies
  const token = `${BASE_URL}${optionsIMDB.trendingMovie}?api_key=${API_KEY}`;
  console.log(token);
  const trendingMoviesData = await fetchTrendingMovies(token, "");
  console.log(trendingMoviesData);
  createGalleryItems(trendingMoviesData);
};

// Function to create gallery items from fetched data
const createGalleryItems = (data) => {
  const markup = data;
    data.results.map(item => {
      const {poster_path, title, genre_ids, release_date, id, vote_average, vote_count, popularity,
             original_title, overview, status} = item;
      const date = new Date(release_date).getFullYear();
      const genre = genre_ids[0];
      const galleryItem = document.createElement(".gallery_fetch-box");
      galleryItem.classList.add('gallery__item');
      if (poster_path) {
        return `
            <div class="card" id="${id}">
                <img class="card_img" src="https://image.tmdb.org/t/p/w400${poster_path}" alt="${title}" />
                <p class="card_title"> ${title} <br />
                    <span class="card_text">${genre} | ${date}</span>
                </p>
            </div>`;
      }
      return `
            <div class="card" id="${id}">
                <img class="card__img"  src="${img}" alt="${title}" />
                <p class="card__titel"> ${title} <br />
                    <span class="card__text">${genre} | ${date}</span>
                </p>
            </div>`;
    })
    .join('');
  galleryItem.insertAdjacentHTML('beforeend', markup);
};