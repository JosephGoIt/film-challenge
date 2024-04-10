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
const galleryEl = document.querySelector(".gallery_fetch-box");
let currentPage = 1;
let totalPages = 0;

// Function to fetch trending movies
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

// Main function to fetch movies, create gallery items, render gallery,
const main = async () => {
  try {
    const param = `${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}`;
    const trendingMoviesData = await fetchTrendingMovies(param);
    totalPages = trendingMoviesData.total_pages;
    console.log(totalPages);
    // const {poster_path, title, genre_ids, release_date, id, vote_average, vote_count, popularity,original_title, overview, status} = trendingMoviesData;
    console.log(trendingMoviesData);
    // Call rederGallery
    renderGallery(trendingMoviesData, totalPages);

  } catch (error) {
    console.error(error);
  }
};

// Render gallery and pagination
function renderGallery(data, totalHits) {
  const hits = data.results; // Assuming the movies are nested within a property named "results"
  const markup = hits.map(generatePhotoCard).join('');
  galleryEl.innerHTML = '';
  galleryEl.insertAdjacentHTML('beforeend', markup);
  if (currentPage >= totalHits) {
      Notify.info("You have reached the end of the results.");
  }
  renderPagination(totalHits);
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

function renderPagination(totalHits) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  console.log(totalHits);
  // const totalPages = Math.ceil(totalHits / options.params.per_page);
  for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.addEventListener('click', () => {
          currentPage = i;
          loadMore();
      });
      pagination.appendChild(pageButton);
  }
}

async function loadMore() {
  try {
    const res = await axios.get(`${IMDB_URL}/3/trending/movie/day?api_key=${IMDB_API_KEY}&page=${currentPage}`);
    const hits = res.data.results;
    renderGallery(hits, res.data.total_results);
  } catch (err) {
    console.error(err);
    // Handle error
  }
}

searchFormEl.addEventListener('submit', onSearchMovies);

async function onSearchMovies (e) {
  e.preventDefault();
  currentPage = 1; // Reset currentPage to 1 when searching
  try {
    let query = searchInputEl.value;
    console.log(query);
    const param = `${IMDB_URL}/3/search/movie?api_key=${IMDB_API_KEY}&query=${query}&language=en-US&page=${currentPage}&include_adult=false`;
    console.log(`Search: ${param}`);
    const trendingMoviesData = await fetchTrendingMovies(param);
    totalPages = trendingMoviesData.total_pages;
    console.log(`Search: ${totalPages}`);
    console.log(`Search Results:`, trendingMoviesData);
    renderGallery(trendingMoviesData, totalPages);
  } catch (error) {
    console.error(error);
  }
};

main();
