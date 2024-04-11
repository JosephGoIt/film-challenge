import axios from 'axios';

// API URL and KEY
const IMDB_API_KEY = '9d52264b8376313698d7d20c165a8537';
const IMDB_URL = 'https://api.themoviedb.org';

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
const searchInputEl = document.querySelector('input[name="searchQuery"]');
const searchFormEl = document.getElementById('search-form');
// const galleryBox = document.querySelector('.gallery-fetch_container');
const galleryEl = document.querySelector(".gallery_fetch-box");
const pagination = document.getElementById('pagination');
let currentPage = 1;
let totalPages = 0;
let functionCaller = 0; // to track which function initiated the call
let param = "";
let query = ""

// Function to fetch movies from the movie database
async function fetchTrendingMovies (arg) {
  try {
    const response = await axios.get(arg);
    if (response.status !== 200) {
      throw new Error("Failed to fetch movies.");
    }
    return response.data;
  } catch (error) {
    console.error(error);
    return []; // Return an empty array
  }
}

// Main function to fetch movies, if there is result will call render gallery,
const main = async () => {
  try {
    param = `${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}`;
    const trendingMoviesData = await fetchTrendingMovies(param);
    totalPages = trendingMoviesData.total_pages; // this is to build pagination, how many pages
    console.log(totalPages); // remove this as this is just for debugging
    console.log(trendingMoviesData); // remove this as this is just for debugging
    // Call rederGallery
    renderGallery(trendingMoviesData);
  } catch (error) {
    console.error(error);
  }
};

// Render gallery and and call pagination
function renderGallery(data) {
  const hits = data.results; // Assuming the movies are nested within a property named "results"
  // call generatePhotoCard
  const markup = hits.map(generatePhotoCard).join('');
  galleryEl.innerHTML = '';
  galleryEl.insertAdjacentHTML('beforeend', markup);
  renderPagination();
  // lightbox.refresh();
}
function generatePhotoCard({poster_path, title, genre_ids, release_date, id, vote_average, vote_count, popularity,original_title, overview, status}) {
  return `<div class="card" id="${id}">
                   <img class="card_img" src="https://image.tmdb.org/t/p/w400${poster_path}" alt="${title}" />
                   <p class="card_title"> ${title} <br />
                       <span class="card_text">${genre_ids} | ${release_date}</span>
                   </p>
              </div>`;
}

function renderPagination() {
  pagination.innerHTML = '';
  console.log(`RenderPagination: ${totalPages}`); // remove this as this is for debugging
  // const totalPages = Math.ceil(totalHits / options.params.per_page);
  for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.addEventListener('click', () => {
          currentPage = i;
          // Call loadMore
          loadMore();
      });
      pagination.appendChild(pageButton);
  }
}

async function loadMore() {
  try {
    // const res = await axios.get(`${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}&page=${currentPage}`);
    if (functionCaller === 0) {
      console.log(`Load more 1: ${functionCaller}`);
      param = `${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}&page=${currentPage}`;
    } else {
      console.log(`Load more 2: ${functionCaller}`);
      param = `${IMDB_URL}/3/search/movie?api_key=${IMDB_API_KEY}&query=${query}&language=en-US&page=${currentPage}&include_adult=false`;
    }
    console.log(`Load more3: ${param}, ${currentPage}`);
    const data = await fetchTrendingMovies(param);
    renderGallery(data);
  } catch (err) {
    console.log(err);
    // Handle error
  }
}

searchFormEl.addEventListener('submit', onSearchMovies);

async function onSearchMovies (e) {
  e.preventDefault();
  functionCaller = 1;
  currentPage = 1; // Reset currentPage to 1 when searching
  try {
    query = searchInputEl.value;
    console.log(query);
    param = `${IMDB_URL}/3/search/movie?api_key=${IMDB_API_KEY}&query=${query}&language=en-US&page=${currentPage}&include_adult=false`;
    console.log(`Search: ${param}`);
    const trendingMoviesData = await fetchTrendingMovies(param, currentPage);
    totalPages = trendingMoviesData.total_pages;
    console.log(`Search: ${totalPages}`);
    console.log(`Search Results:`, trendingMoviesData);
    renderGallery(trendingMoviesData, totalPages);
  } catch (error) {
    console.error(error);
  }
};

main();
