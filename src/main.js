// const apiKey = '4c11dda30fa79525a8c35682d64e94a7';

const actualTempTxt = document.querySelector('#actual-temp');
const cityTxt = document.querySelector('#city');
const dateTxt = document.querySelector('#date');
const weeklyTxt = document.querySelector('#weekly');

const cityInput = document.querySelector('#city-input')

const API_KEY = '8770d91a5e39581cbe0f8b6be7c75f33';

if(navigator.geolocation){
    navigator.geolocation.watchPosition(async function (position, lang = 'fr') {
        const {latitude : lat, longitude: lon} = position.coords;
        const {resumeData, dailyData} = await getApiData(lat,lon)
        displayResumeInfo(resumeData,lang)
        displayDailyInfo(dailyData, lang)
    },()=> AppWithOutGeolocation() )

}else{
    AppWithOutGeolocation()
}

cityInput.addEventListener("keyup", (event) => { 
    cityAutoCompletion(event.target)
})

async function AppWithOutGeolocation(city = 'Paris',lang='fr') {
    const { resumeData, dailyData } = await getApiDataBySearch(city);
    displayResumeInfo(resumeData,lang);
    displayDailyInfo(dailyData,lang);
}

async function getApiData(lat,lon,lang='fr') {    
    const apiCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${API_KEY}`;
    const apiOneCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=${lang}&appid=${API_KEY}`;
    let resumeData = await (await fetch(apiCurrent)).json()
    let {daily: dailyData} = await (await fetch(apiOneCall)).json()     

    return {resumeData, dailyData}
}

async function getApiDataBySearch(city = "Paris",lang="fr"){
    const apiCitySearch = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=${lang}&appid=${API_KEY}`;

    let {coord : {lon ,lat}} = await (await fetch(apiCitySearch)).json()

    return await getApiData(lat,lon)
}

function displayDailyInfo(dailyData,lang) {
    //interation on weekdays
    weeklyTxt.innerHTML = ""
    for (let i = 0; i < dailyData.length; i++) {
        let dateResponse = dateFormatTimestamp(dailyData[i].dt,{ weekday: 'short' },lang);
        let dayComponent = `
        <div class="day">
            <h3>${dateResponse}</h3>
            <p>min : <span class="minday">${Math.round(dailyData[i].temp.min)}°</span></p>
            <p>max : <span class="maxday">${Math.round(dailyData[i].temp.max)}°</span></p>
        </div>
        `;
        weeklyTxt.insertAdjacentHTML("beforeend", dayComponent);
    }
}

function displayResumeInfo(json,lang) {
    cityTxt.innerHTML = ""
    actualTempTxt.innerHTML = Math.round(json.main.temp);
    cityTxt.innerHTML = json.name;
    //les jours
    let formatOption = {
        day: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'short'
    };
    dateTxt.innerHTML = dateFormatTimestamp(json.dt,formatOption,lang);
};

function dateFormatTimestamp(timestamp,formatOption = {},lang){
    let dtFormat = new Intl.DateTimeFormat(lang, formatOption);
    return dtFormat.format(new Date(timestamp*1000))
}
async function cityAutoCompletion(input) {
    let url = `https://api-adresse.data.gouv.fr/search/?q=${input.value}&type=municipality&autocomplete=1&limit=3`; 
    console.log(url)
    let data = await (await fetch(url)).json();
    let cities = [];
    data.features.forEach((city) => {
        cities.push({
            name: city.properties.name,
            context: city.properties.context.split(',').splice(1,1),
        });
    });
    removeElements(input);
    cities.forEach((city) => {
        let cityItem = document.createElement("li");
        //One common class name
        cityItem.classList.add("list-items");
        cityItem.classList.add("list-group-item");
        cityItem.style.cursor = "pointer";
        cityItem.setAttribute("onclick", `selectedCity("${city.name}")`);
        //Display matched part in bold
        let word = city.name.replace(input.value, `<b>${input.value}</b>`);
        //display the value in array
        cityItem.innerHTML = `${word} <br> <small class="text-muted">${city.context.join()}</small>`;
        input.parentElement.querySelector(".list").appendChild(cityItem);

    });
}
function removeElements(input) {
    //clear all the item
    let items = input.parentElement.querySelectorAll(".list-items");
    items.forEach((item) => {
        item.remove();
    });
}
function selectedCity(value) {
    let element = this.event.target.parentElement;
    let input = element.parentElement.querySelector("#city-input");
    input.value = value;
    removeElements(element);
    AppWithOutGeolocation(value);
}