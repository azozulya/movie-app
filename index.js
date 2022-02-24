const key = "cf4bf5f7";
const movieUrl = new URL(`https://www.omdbapi.com/?apikey=${key}&i=`);
const url = new URL(`https://www.omdbapi.com/?apikey=${key}&`);

async function getData(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
  
    return data;
  } catch (e) {
    console.log(e);
    return {};
  }
}

const isEmpty = val => val === "N/A";

const checkValue = (val, outputVal) => isEmpty(val) ? '' : outputVal;

const formatTime = val => {
  const inpTime = parseInt(val); 
  const hour = Math.trunc(inpTime / 60);
  const minutes = inpTime - hour * 60; 
  return `${ hour } h ${ minutes} min`;
}

const showItem = item => { 
  if(!item)
    return;

  const {Genre, Plot, Runtime, imdbID, imdbRating} = item;
  const el = document.getElementById(imdbID);

  if(el) {
    const beforeEnd = checkValue(imdbRating, `<div class="movie__rating">${ imdbRating }</div>`) + checkValue(Runtime, `<div class="movie__runtime">${ formatTime(Runtime) }</div>`);
    
    beforeEnd && el.insertAdjacentHTML('beforeend', beforeEnd);
    el.querySelector('.movie__year').insertAdjacentHTML('beforeend', ` ${Genre}`);

    if(!isEmpty(Plot)) {
      const btn = el.querySelector(`[data-id="${imdbID}__overview"]`);
      btn && btn.classList.remove('hidden');
      el.addEventListener('click', clickHandler);
      el.addEventListener('mouseleave', hideOverview);
      el.insertAdjacentHTML('beforeend', `<div id="${imdbID}__overview" class="movie__overview"><h3>Overview</h3> ${Plot}</div>`);
    }
  }  
}

const clickHandler = event => {
  const target = event.target; 

  if(target.classList.contains('movie__btn')) {
    const overview = document.getElementById(target.dataset.id);
    overview && overview.classList.add('active');   
  }  
}

const hideOverview = event => { 
  const active = document.querySelector('.movie__overview.active');
  active && active.classList.remove('active');
}

const loading = document.createElement('div');
loading.className = 'loading';


document.addEventListener('DOMContentLoaded', function() {
  const moviesContainer = document.querySelector('.movies');
  const searchInput = document.querySelector('.search__input');
  const searchForm = document.querySelector('.search__form');
  const messageContainer = document.querySelector('.message');

  const showMessage = mes => {
    messageContainer.innerText = '';  
    messageContainer.insertAdjacentHTML("afterbegin", mes);
  }

  const showDefaultMovies = () => getData("./data/summer.json").then(data => showData(data.Search));

  const showData = data => { 
    if(!data)
      return "Bad request. Nothing found.";
      
    moviesContainer.innerText = '';

    const items = data.map(item => {
      const {Title, Poster, Year, imdbID} = item;
      const img = Poster.length > 3 ? `<img src="${Poster}" width="300" alt="${Title}" class="movie__poster-img">` : '';

      getData(movieUrl + `${imdbID}`).then(data => showItem(data));

      return `
        <div id="${imdbID}" class="movie">
          <button data-id="${imdbID}__overview" class="movie__btn hidden">&#10230;</button>
          <div class="movie__poster">
            ${ img }
          </div>
          <div class="movie__info">
            <h2 class="movie__title">${ Title }</h2>
            <p class="movie__year">${ Year }</p>
          </div>
        </div>
      `;
    });

    moviesContainer.insertAdjacentHTML('afterbegin', items.join(""));
  }

  const searchHandler = event => {
    event.preventDefault();
    const val = searchInput.value.trim();

    if (val) {
        moviesContainer.innerText = '';
        moviesContainer.insertAdjacentElement('afterbegin', loading);
        getData(new URL(url + `s=${val}&page=1`)).then(data => {
          if(data.Error) {
            showDefaultMovies();
            return showMessage(`${data.Error} <br/> Local version.`);
          }
          messageContainer.innerText = '';  
          showData(data.Search);
        });
    }
  }

  showDefaultMovies();
  
  searchForm.addEventListener('submit', searchHandler);
});