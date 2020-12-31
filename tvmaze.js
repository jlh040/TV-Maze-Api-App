/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);
  const shows = [];
  const tvShows = res.data;

  for (let theShow of tvShows) {
    let id = theShow.show.id;
    let name = theShow.show.name;
    let summary = theShow.show.summary;
    let image = theShow.show.image === null ? 'https://tinyurl.com/tv-missing' : theShow.show.image.original;

    shows.push({
      id,
      name,
      summary,
      image
    })
  }

  return shows;
}




/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img class="card-img-top" src=${show.image}>
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-outline-primary" id="episode-button">
                Display Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)
  const episodes = [];

  const episodesArr = res.data;
  for (let episode of episodesArr) {
    let id = episode.id;
    let name = episode.name;
    let season = episode.season;
    let number = episode.number;

    episodes.push({
      id, 
      name, 
      season, 
      number
    })
  }

  return episodes;
}

function populateEpisodes(episodes) {
  const $episodesList = $('#episodes-list');
  for (let episode of episodes) {
    let episodeLi = $(
      `<li class="list-group-item">
          ${episode.name} (Season ${episode.season}, Episode ${episode.number})
      </li>`
    );

    episodeLi.appendTo($episodesList);
  }
}

$('#shows-list').on('click', '#episode-button', async function() {
  $("#episodes-list").empty();

  let $showId = $(this).closest('.Show').data('show-id');
  let episodes = await getEpisodes($showId);
  populateEpisodes(episodes);
  $('#episodes-area').show();
})
