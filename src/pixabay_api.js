import axios from 'axios';
const key = '38422829-8bf60998ef044b4874e8c64d5';

axios.defaults.baseURL = 'https://pixabay.com/api/';
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return Promise.reject(error);
  }
);

async function fetchImages(query, page, perPage) {
  const response = await axios.get(
    `?key=${key}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
  );
  return response.data;
}

export { fetchImages };
