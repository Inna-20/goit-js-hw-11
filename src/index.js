import './css/styles.css';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const inputSerchForm = document.querySelector('#search-form');
const galleryItemsList = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');

inputSerchForm.addEventListener('submit', onFormSubmit);
btnLoadMore.addEventListener('click', onBtnLoadMoreClick);

const URL = 'https://pixabay.com/api/?key=27883236-6969d09a32616dc8554790263';
const PER_PAGE = 40;
const PARAMETER = `&image_type=photo&orientation=horizontal&safesearch=true&per_page=${PER_PAGE}`;

let value = '';
let page;
btnLoadMore.classList.add('is-hiden');

async function fetchGalery(value, page) {
    const response = await axios.get(`${URL}&q=${value}${PARAMETER}&page=${page}`);
    const images = await response.data;
    return images;
}

async function onFormSubmit(event) {
    event.preventDefault();
    galleryItemsList.innerHTML = '';
    page = 1;
    value = inputSerchForm.elements.searchQuery.value;
    if (!value.trim()) {
        btnLoadMore.classList.add('is-hiden');
        Notify.info('Please, write something');
        return;
    }
    try {
        const { hits, totalHits } = await fetchGalery(value, page);
        if (!totalHits) {
            btnLoadMore.classList.add('is-hiden');
            Notify.failure('Sorry, no matches were found for your query.');
            return;
        }
        Notify.success(`Hooray! We found ${totalHits} images.`);
        createMarkup({ hits, totalHits });
        btnLoadMore.classList.remove('is-hiden');
    } catch (error) {
        console.log(error.message);
    }
}

async function onBtnLoadMoreClick() {
    page += 1;
    try {
        const images = await fetchGalery(value, page);
        createMarkup(images);
    } catch (error) {
        console.log(error.message);
    }
    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}

function createMarkup({ hits, totalHits }) {
    const pageLimit = Math.ceil(totalHits / PER_PAGE);
    const imagesMarkup = hits
        .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
            return `<a class="gallery-item" href="${largeImageURL}">
      <div class="photo-card">
        <div class="container-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </div>  
        <div class="info">
          <p class="info-item">
            <b>Likes </b>${likes}
          </p>
          <p class="info-item">
            <b>Views </b>${views}
          </p>
          <p class="info-item">
            <b>Comments </b>${comments}
          </p>
          <p class="info-item">
            <b>Downloads </b>${downloads}
          </p>
        </div>
      </div>
    </a>`;
        })
        .join('');
    galleryItemsList.insertAdjacentHTML('beforeend', imagesMarkup);

    lightbox.refresh();

    if (pageLimit === page) {
        setTimeout(() => {
            Notify.info("We're sorry, but you've reached the end of search results.");
            btnLoadMore.classList.add('is-hiden');
        }, 0);
    }
}

let lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 300,
});

galleryItemsList.addEventListener('click', e => {
    e.preventDefault();
});