import axios from 'axios';
import { paginationFetch } from '../pagination';

// API URL and KEY
const IMDB_API_KEY = '9d52264b8376313698d7d20c165a8537';
const IMDB_URL = 'https://api.themoviedb.org';

// Genres
export const genres = [
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

const searchInputEl = document.querySelector('input[name="searchQuery"]');
const searchFormEl = document.getElementById('search-form');
const galleryEl = document.querySelector(".gallery_fetch-box");
const watched = document.querySelector('.watched-btn');
const queued = document.querySelector('.queue-btn');
const pagination = document.getElementById('pagination');

let currentPage = 1;
let totalPages = 0;
let functionCaller = 0;
let param = "";
let query = "";

async function fetchMovies(url) {
    try {
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error("Failed to fetch movies.");
        }
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

function generatePhotoCard({ poster_path, title, genre_ids, release_date, id }) {
    const movieGenres = findGenresOfMovie(genre_ids);
    return `<div class="card" id="${id}">
                   <img class="card_img" src="https://image.tmdb.org/t/p/w400${poster_path}" alt="${title}" />
                   <p class="card_title"> ${title} <br />
                       <span class="card_text">${movieGenres} | ${release_date}</span>
                   </p>
              </div>`;
}

function renderGallery(data) {
    const markup = data.results.map(generatePhotoCard).join('');
    galleryEl.innerHTML = '';
    galleryEl.insertAdjacentHTML('beforeend', markup);
    renderPagination();
}

function renderPagination() {
    pagination.innerHTML = '';
    paginationFetch(currentPage, totalPages)
}

async function loadMore() {
    try {
        const url = functionCaller === 0 ?
            `${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}&page=${currentPage}` :
            `${IMDB_URL}/3/search/movie?api_key=${IMDB_API_KEY}&query=${query}&language=en-US&page=${currentPage}&include_adult=false`;
        const data = await fetchMovies(url);
        renderGallery(data);
    } catch (err) {
        console.log(err);
    }
}

async function searchMovies() {
    try {
        query = searchInputEl.value;
        const url = `${IMDB_URL}/3/search/movie?api_key=${IMDB_API_KEY}&query=${query}&language=en-US&page=${currentPage}&include_adult=false`;
        const trendingMoviesData = await fetchMovies(url);
        totalPages = trendingMoviesData.total_pages;
        renderGallery(trendingMoviesData);
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
  // Trigger main function when the DOM content is loaded
  await main();
});

searchFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    functionCaller = 1;
    currentPage = 1;
    await searchMovies();
});

queued.addEventListener('click', () => renderFilmDetailsFromLocalStorage('queued'));
watched.addEventListener('click', () => renderFilmDetailsFromLocalStorage('watched'));

async function main() {
  // Initialize the application
  try {
      await fetchTrendingMovies(); // Fetch trending movies on app load
  } catch (error) {
      console.error(error);
  }
}

async function fetchTrendingMovies() {
  try {
      const response = await axios.get(`${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}`);
      if (response.status === 200) {
          const trendingMoviesData = response.data;
          console.log(trendingMoviesData);
          totalPages = trendingMoviesData.total_pages;
          renderGallery(trendingMoviesData);
      } else {
          throw new Error("Failed to fetch movies.");
      }
  } catch (error) {
      console.error(error);
  }
}

export function findGenresOfMovie(ids) {
  try {
      if (!ids) return ""; // Return empty string if ids is undefined or null
      const movieGenres = ids.flatMap(id => genres.filter(element => element.id === id)).map(el => el.name);
      return movieGenres.length > 2 ? [...movieGenres.splice(0, 2), 'Other'].join(', ') : movieGenres.join(', ');
  } catch (error) {
      console.error(error);
      return ""; // Return empty string in case of error
  }
}

function renderFilmDetailsFromLocalStorage(status) {
  try {
      const filmDetails = JSON.parse(localStorage.getItem('filmDetails')) || {};
      const data = Object.values(filmDetails).filter(film => film.status === status);
      const markup = data.map(({ id, poster_path, title, genres, release_date }) => {
          const movieGenres = findGenresOfMovie(genres);
          return `<div class="card" id="${id}">
                      <img class="card_img" src="https://image.tmdb.org/t/p/w400${poster_path}" alt="${title}" />
                      <p class="card_title">${title} <br />
                          <span class="card_text">${genreNames(genres)} | ${release_date}</span>
                      </p>
                  </div>`;
      }).join('');

      galleryEl.innerHTML = markup;
      currentPage = 1;
      if (data.length > 20) {
        totalPages = Math.ceil(data.length/20);
      } else {
        totalPages = 1;
      }
      renderPagination();
      
  } catch (error) {
      console.error(error);
  }
}

function genreNames (genres) {
    let genreNames = genres.map(genre => genre.name);

if (genreNames.length > 2) {
    const firstTwoGenres = genreNames.slice(0, 2).join(', ');
    const remainingGenres = "Others";
    genreNames = `${firstTwoGenres}, ${remainingGenres}`;
} else {
    genreNames = genreNames.join(', ');
}
return genreNames;
}

document.addEventListener('DOMContentLoaded', function () {
    const libLink = document.querySelector('.lib');
    const heroSection = document.querySelector('.hero');
    const libraryHeroSection = document.querySelector('.library-hero');

    libLink.addEventListener('click', function (event) {
        event.preventDefault();
        heroSection.classList.toggle('hidden');
        libraryHeroSection.classList.toggle('hidden');
        renderFilmDetailsFromLocalStorage('watched');
    });
});

pagination.addEventListener('click', (event) => {
    const target = event.target;
    if(isNaN(target.textContent) && target.classList.contains('btn-right') && currentPage < totalPages){
        currentPage = currentPage + 1;
        loadMore();
    } else if (isNaN(target.textContent) && target.classList.contains('btn-left') && currentPage > 1) {
        currentPage = currentPage - 1;
        loadMore();
    } else if (!isNaN(target.textContent)) {
        currentPage = parseInt(target.textContent);
        loadMore();
    }
});