//given a search term, returns an array of shows related to that term
async function searchShows(query) {
  //send a GET request for the show data, make the shows array, and select the response show array
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);
  const shows = [];
  const tvShows = res.data;

  for (let theShow of tvShows) {
    //loop over the response show array, pull out the data that we need, if there is no image for the show
    //use a filler image
    let id = theShow.show.id;
    let name = theShow.show.name;
    let summary = theShow.show.summary;
    let image = theShow.show.image === null ? 'https://tinyurl.com/tv-missing' : theShow.show.image.original;

    //put the data in an object and put the object in the shows array
    shows.push({
      id,
      name,
      summary,
      image
    })
  }

  //return the shows array
  return shows;
}




//given an array of shows, populate the page with those shows
function populateShows(shows) {
  //select the show list and empty out any shows that are on the page
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    //loop over the array of shows, make a Bootstrap card for each show
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

    //append the Bootstrap card to the the show list  
    $showsList.append($item);
  }
}

//listen for a form submit in the search area
$("#search-form").on("submit", async function handleSearch (evt) {
  //prevent the page from refreshing upon submit
  evt.preventDefault();

  //select the search value, if the search box is empty, do nothing
  let query = $("#search-query").val();
  if (!query) return;

  //get rid of any episodes that were on the page
  $("#episodes-area").hide();

  //request and then store our array of shows
  let shows = await searchShows(query);

  //populate the page with these shows
  populateShows(shows);
});


//Given an ID for a show, it returns an array of episodes for that show.

async function getEpisodes(id) {
  //Send a GET request for the episodes data and initialize our episodes array
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)
  const episodes = [];

  //Loop through the response episodes array and pull out the details that we want, then put them into
  //in an object, and put them in an array
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

  //return the array
  return episodes;
}

// Given an array of episodes, populate the page with those episodes. (Into the episode list)

function populateEpisodes(episodes) {
  //Select the episode list
  const $episodesList = $('#episodes-list');

  //Loop through the array of episodes. For each episode, create an LI.
  for (let episode of episodes) {
    let episodeLi = $(
      `<li class="list-group-item list-group-item-primary">
          ${episode.name} (Season ${episode.season}, Episode ${episode.number})
      </li>`
    );
    
    //Append this li to the episode list
    episodeLi.appendTo($episodesList);
  }
}

//Listen for clicks on the 'Display Episodes' button.

$('#shows-list').on('click', '#episode-button', async function() {
  //Empty the episodes list in case there are already episodes being displayed
  $("#episodes-list").empty();

  /*Get the show ID, pass the show ID into getEpisodes to get the episodes corresponding to that show. 
  Populate the page with those episodes, and then change the display value of the episodes list to reflect
  this change*/
  let $showId = $(this).closest('.Show').data('show-id');
  let episodes = await getEpisodes($showId);
  populateEpisodes(episodes);
  $('#episodes-area').show();
})
