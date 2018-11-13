class Mashed {
  constructor() {
    this.search = this.search.bind(this);

    this.initialize();
    this.addEventListeners();
  }
 
  initialize() {
    // Egenskaper för instanser av den här klassen, används för att referera till samma Node/Element i DOM.
    this.sentinel = document.querySelector('.sentinel');
    this.searchInput = document.querySelector('.search input');
    this.searchBtn = document.querySelector('.search button');
    this.sidebarWords = document.querySelectorAll('aside ul');
    this.searchResultsContainer = document.querySelector('.results ul');

    // Frivilligt: för att visa en laddningsindikator!
    this.loadingIndicator = document.querySelector('.loader');
  }

  /**
   * Metod som sätter upp våra eventlyssnare
   */
  addEventListeners(){ 
    // Eventlyssnare för sök-knappen
    this.searchBtn.addEventListener('click', event =>
      this.search(event, this.searchInput.value)
    );

    /*
    * Eventlyssnare för alla ord i sidomenyn
    * För mer information om forEach: https://mzl.la/IysHjg
    */
    this.sidebarWords.forEach(wordEl =>
      wordEl.addEventListener('click', event =>
        this.search(event, event.target.textContent)
      )
    );
  }

  
  /**
   * Metod (används som callback) för att hantera sökningar
   *
   * @param {*} event Det event som gjorde att denna callback anropades
   * @param {*} [searchString=null] Den söksträng som användaren matat in i fältet, är null by default
   */
  search(event, searchString = null) {
    event.preventDefault();
    // Om söksträngen inte är tom och är definierad så ska vi söka
  
    if (this.checkSearchInput(searchString)) {
      console.log(`Trigga sökning med ${searchString}`);
// 1) Bygg upp en array med anrop (promise) till fetchFlickrPhotos och fetchWordlabWords med searchString
      // Notera: att ordningen du skickar in dessa i spelar roll i steg 3)
      var requestOne = this.fetchFlickrPhotos(searchString);
      var requestTwo = this.fetchWordlabWords(searchString);
      let promiseArray = [requestOne, requestTwo]; 
      // 2) Använd Promise.all för att hantera varje anrop (promise)
      // 2 a) then(results) => Om varje anrop lyckas och varje anrop returnerar data
      // 2 b) catch() => Om något anrop misslyckas, visa felmeddelande
      Promise.all(promiseArray) 
      .then((res) => {
        return res.map(response => {
            if(response.status === 200) {
            
                return response.json(); //response görs om till JSON.
               
            } else {console.log("Funkar inte!");
        }  
        })
            })
            .catch((reason) => console.log(reason))
            .then((res) => {
              Promise.all(res).then((data) => {
                this.renderFlickrResults(data)
                this.renderWordlabResults(data)
                console.log(data);
              
              }) 
          })
            .catch(err => console.log(err))
        }
      else {
        console.log(
          `Söksträngen är tom, visa ett meddelande eller bara returnera`
        );
        return;
      }}
    
     
      // 3) För varje resultat i arryen results, visa bilder från FlickR or ord från WordLab.
      // 4 results[0] kommer nu innehålla resultat från FlickR och results[1] resultat från WordLab.
      // 5 skapa element och visa dem i DOM:en med metoderna (renderFlickResults och renderWordlabResults)

      
  

  /**
   * Metod som används för att kolla att söksträngen är giltig
   *
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns Boolean (true/false)
   */
  checkSearchInput(searchString) {
    return searchString && searchString.trim().length > 0;
  }

  /**
   *  Metod som används för att göra API-anrop till Flickr's API för att få bildresultat.
   *
   * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns {Promise} Ett fetch() Promise
   */
  fetchFlickrPhotos(searchString) {
    let flickrAPIkey = `f87cf05024c2a7309c4243502d3120ba`; // Din API-nyckel här
    let flickerAPIRootURL = `https://api.flickr.com/services/rest/?`; // Grundläggande delen av Flickr's API URL

    // Olika sökparametrar som behövs för Flickr's API. För mer info om detta kolla i Flickrs API-dokumentation
    let flickrQueryParams = `&method=flickr.photos.search&api_key=${flickrAPIkey}&text=searchString&extras=url_q, url_o, url_m&format=json&tags=${searchString}&license=2,3,4,5,6,9&sort=relevance&parse_tags=1&nojsoncallback=1`;
    let flickrURL = `${flickerAPIRootURL}${flickrQueryParams}`;

    return fetch(flickrURL);
  }

  /**
   * Metod som används för att göra API-anrop till wordlab API:et för att få förslag på andra söktermer
   *
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns {Promise} Ett fetch() Promise
   */
  fetchWordlabWords(searchString) {
    let wordLabAPIkey = `8acdc2138480ba2c4049b500924deb7f`; // Din API-nyckel här
    let wordLabURL = `http://words.bighugelabs.com/api/2/${wordLabAPIkey}/${searchString}/json`;
    return fetch(wordLabURL);
  }

  /**
   * Metod som skapar bild-element och relaterade element för varje sökresultat mot Flickr
   *
   * @param {Object} data Sökresultaten från Flickr's API.
   */
  renderFlickrResults(data) {
    let dataFirstArr = data[0].photos.photo;
    console.log(dataFirstArr);
    for (let j=0; j<dataFirstArr.length; j++) {
      console.log(dataFirstArr);
      let aElement = document.createElement("a");
      aElement.setAttribute('href', dataFirstArr[j].url_q);
let liElement = document.createElement("li");
let ulElement = document.getElementById("resultUl");
let imageElement = document.createElement('img'); // use DOM HTMLImageElement
imageElement.alt = dataFirstArr[j].title;
imageElement.title= dataFirstArr[j].title;
// let image = document.createElement('img');
imageElement.src = dataFirstArr[j].url_q; //'image2.jpg';
liElement.appendChild(aElement);
aElement.appendChild(imageElement);
    //  liElement.appendChild(imageElement);
    ulElement.appendChild(liElement); 
    //skapa element
  }}

  /**
   * Metod som skapar ord-element för relaterade sökord som kommer från Wordlabs API
   *
   * @param {Object} data Sökresultaten från Flickr's API.
   */
  renderWordlabResults(data) {
    let dataSecArr = data[1].noun.syn;
    for (let i=0; i<dataSecArr.length; i++) {
    let aElem = document.createElement("a");
    let ulElem = document.getElementById("asideList");
    let listElem = document.createElement("li");
    aElem.textContent = dataSecArr[i];
    aElem.setAttribute('href', "searchString");
    listElem.appendChild(aElem);
    ulElem.appendChild(listElem);   
    //skapa element
  } 
  }
}
// Immediately-Invoked Function Expression, detta betyder att när JS-filen läses in så körs koden inuti funktionen nedan.
(function() {
  new Mashed();
})();
