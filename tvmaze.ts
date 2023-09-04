import axios from "axios";
import jQuery from 'jquery';

const $ = jQuery;

const $showsList: JQuery = $("#showsList");
const $episodesArea: JQuery = $("#episodesArea");
const $searchForm: JQuery = $("#searchForm");

const TV_MAZE_SEARCH_URL: string = "http://api.tvmaze.com/search/shows";
const TV_MAZE_EPISODES_URL: string = "http://api.tvmaze.com/shows";
const TV_MAZE_LOGO_IMG: string = "https://pbs.twimg.com/media/EIOH05vWoAA0yr2.jpg";

interface ApiShowInterface { show: {
  id: number;
  name: string;
  summary: string;
  image: ({medium: string, original: string} | null ) ;
}
}

interface ShowInterface {
  id: number;
  name: string;
  summary: string;
  image: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShowsByTerm(term: string): Promise<ShowInterface[]> {

  // pull the param/input value from $searchForm
  // make API request using that value (q=searchTerm)
  // map over the requests and put it in ShowInterface format
  // return result of that map

  const searchTerm = $searchForm.val();

  const response = await axios.get(TV_MAZE_SEARCH_URL, { params: { q: searchTerm }});

  const showsApiData: ApiShowInterface[] = response.data;

  // don't need to type my callback to say what the item being looped over is because ewe are looping over showsApiData
  const shows = showsApiData.map( item => {
    const show = item.show;
    return {
    id: show.id,
    name: show.name,
    summary: show.summary,
    image: ( show.image ? show.image?.original : TV_MAZE_LOGO_IMG)
  }});

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show: JQuery = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="http://static.tvmaze.com/uploads/images/medium_portrait/160/401704.jpg"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows: ShowInterface[] = await searchShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// async function getEpisodesOfShow(id) { }

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }