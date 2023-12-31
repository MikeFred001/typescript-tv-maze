import axios from "axios";
import jQuery from 'jquery';

const $ = jQuery;

const $showsList: JQuery = $("#showsList");
const $episodesArea: JQuery = $("#episodesArea");
const $episodesList: JQuery = $("#episodesList");
const $searchForm: JQuery = $("#searchForm");

const TV_MAZE_SEARCH_URL: string = "http://api.tvmaze.com/search/shows";
const TV_MAZE_EPISODES_URL: string = "http://api.tvmaze.com/shows";
const TV_MAZE_LOGO_IMG: string = "https://pbs.twimg.com/media/EIOH05vWoAA0yr2.jpg";

interface ApiShowInterface {
  show: {
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

interface EpisodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function searchShowsByTerm(term: string): Promise<ShowInterface[]> {
  console.log("TERM", term);

  const response = await axios.get(TV_MAZE_SEARCH_URL, { params: { q: term }});

  const showsApiData: ApiShowInterface[] = response.data;

  const shows = showsApiData.map( item => {
    const show = item.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: ( show.image ? show.image?.original : TV_MAZE_LOGO_IMG)
    }
  });

  return shows;
}


/** Empty the showsList in DOM.
 * Given list of shows, create markup for each show and append to DOM */
function populateShows(shows: ShowInterface[]): void {
  $showsList.empty();
  for (let show of shows) {
    const $show: JQuery = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="${show.name}"
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
      `)

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
async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios.get(`${TV_MAZE_EPISODES_URL}/${id}/episodes`);
  const data: EpisodeInterface[] = response.data;

  console.log("episodes consolelog", data);

  const episodes = data.map(episode => {
    console.log(episode);
    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    };
  });

  return episodes;
}

/** Empty the episodesList section in DOM.
 * Repopulate list with episodes of show.
 * Takes an array of episodes [ { id, name, season, number }, ... ]
 */
function populateEpisodes(episodes: EpisodeInterface[]): void {
  $episodesList.empty();

  for (const episode of episodes) {
    const $episode: JQuery = $(`
        <li>
          ${episode.name} (Season ${episode.season}, Number ${episode.number})
        </li>
      `);

    $episodesList.append($episode);
  }
}

/** Fetch episodes for show of showId from TVMAZE api.
 * Populate episodes list in DOM.
 * Reveal the episodes area on page.
 * Takes a showId: number
*/
async function retrieveAndDisplayEpisodes(showId: number): Promise<void> {
  const episodes: EpisodeInterface[] = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
  $episodesArea.show();
}


/** Click handler, retrieves and displays episodes for target show on click. */
$showsList.on("click", "button",
  async function handleEpisodesButton(evt: JQuery.ClickEvent) {
  const id = $(evt.target).closest("div.Show").data("showId");
  await retrieveAndDisplayEpisodes(id);
});