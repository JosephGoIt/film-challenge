import axios from 'axios';
import { paginationFetch } from './pagination';

// API URL and KEY
const IMDB_API_KEY = '9d52264b8376313698d7d20c165a8537';
const IMDB_URL = 'https://api.themoviedb.org';
const MOVIES_PER_PAGE = 20;

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
const homeLink = document.querySelector('.home');

let currentPage = 1;
let totalPages = 0;
let totalMovies = 0;
let movies = [];
let splittedMovieSet;
let functionCaller = 0;
let param = "";
let query = "";
let moviesOnPage = "";

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
        let url = "";
        let data = "";
        if (functionCaller === 2) {
            data = await renderFilmDetailsFromLocalStorage ('watched', currentPage);
        } else if (functionCaller ===3) {
            data = await renderFilmDetailsFromLocalStorage ('queued', currentPage);
        } else {
        url = functionCaller === 0 ?
            `${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}&page=${currentPage}` :
            `${IMDB_URL}/3/search/movie?api_key=${IMDB_API_KEY}&query=${query}&language=en-US&page=${currentPage}&include_adult=false`;
            data = await fetchMovies(url);
        }
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

queued.addEventListener('click', () => renderFilmDetailsFromLocalStorage('queued', 1));
watched.addEventListener('click', () => renderFilmDetailsFromLocalStorage('watched', 1));

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

function renderFilmDetailsFromLocalStorage(status, pageNumber) {
    try {
        // status==='watched'?functionCaller=2:functionCaller=3;
        if(status==='watched'){
            functionCaller=2;
            watched.classList.add('active');
            queued.classList.remove('active');
        } else if (status==='queued') {
            functionCaller=3;
            watched.classList.remove('active');
            queued.classList.add('active');
        }
        const filmDetails = JSON.parse(localStorage.getItem('filmDetails')) || {};
        const data = Object.values(filmDetails).filter(film => film.status === status);
        totalMovies = data.length;
        totalPages = Math.ceil(totalMovies / MOVIES_PER_PAGE);
        if (pageNumber < 1 || pageNumber > totalPages) {
            console.error('Invalid page number');
            return;
        }

        const startIndex = (pageNumber - 1) * MOVIES_PER_PAGE;
        const endIndex = Math.min(startIndex + MOVIES_PER_PAGE, totalMovies);
        moviesOnPage = data.slice(startIndex, endIndex);
        console.log(moviesOnPage);

        const markup = moviesOnPage.map(({ id, poster_path, title, genres, release_date }) => {
            const movieGenres = findGenresOfMovie(genres);
            console.log(release_date);
            return `<div class="card" id="${id}">
                        <img class="card_img" src="https://image.tmdb.org/t/p/w400${poster_path}" alt="${title}" />
                        <p class="card_title">${title} <br />
                            <span class="card_text">${genreNames(genres)} | ${release_date}</span>
                        </p>
                    </div>`;
        }).join('');

        galleryEl.innerHTML = markup;
        currentPage = pageNumber;
        renderPagination(1, totalPages);
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

    function libLinkClickHandler(event) {
        event.preventDefault();
        heroSection.classList.toggle('hidden');
        libraryHeroSection.classList.toggle('hidden');
        homeLink.classList.remove('current');
        libLink.classList.add('current');
        libLink.removeEventListener('click', libLinkClickHandler); // Remove click event listener
        watched.classList.add('active');
        renderFilmDetailsFromLocalStorage('watched', 1);
        functionCaller = 2;
    }

    libLink.addEventListener('click', libLinkClickHandler);
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