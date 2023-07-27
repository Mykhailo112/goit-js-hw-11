import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './pixabay_api';

const ref = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};

const { searchForm, gallery } = ref;

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);

function renderGallery(images) {
  if (!gallery) {
    return;
  }

  const markup = images
    .map(image => {
      const {
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
   
  <div class="photo-card">
  <a  href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" class="photo" />
  <div class="info">
    <p class="info-item"><b>Likes</b>${likes}</p>
    <p class="info-item"><b>Views</b>${views}</p>
    <p class="info-item"><b>Comments</b>${comments}</p>
    <p class="info-item"><b>Downloads</b>${downloads}</p>
  </div>
 </a>  
</div>
`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  gallery.innerHTML = '';

  // if (query === '') {
  //   Notiflix.Notify.failure(
  //     'The search string cannot be empty. Please specify your search query.'
  //   );
  //   return;
  // }

  fetchImages(query, page, perPage)
    .then(data => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        renderGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

function onLoadMore() {
  page += 1;
  simpleLightBox.destroy();

  fetchImages(query, page, perPage)
    .then(data => {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        Notiflix.Notify.failure(
          `We're sorry, but you've reached the end of search results.`
        );
      }
    })
    .catch(error => console.log(error));
}
function checkEndPages() {
  return (
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
  );
}

function loadMorePages() {
  if (checkEndPages()) {
    onLoadMore();
  }
}

window.addEventListener('scroll', loadMorePages);
