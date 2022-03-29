const apiKey = '4c11dda30fa79525a8c35682d64e94a7';
const actualTempTxt = document.querySelector('#actual-temp');
const cityTxt = document.querySelector('#city');
const dateTxt = document.querySelector('#date');
const weeklyTxt = document.querySelector('#weekly');

let lat;
let lon;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) 
    {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        const apiCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
        const apiOneCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;
        console.log(lat, lon);

        fetch(apiCurrent).then(
            function (response) {
                response.json().then(
                    function (json) {
                        actualTempTxt.innerHTML = Math.floor(json.main.temp);
                        cityTxt.innerHTML = json.name;                        
                        //les jours
                        let dtFormatDayOnly = new Intl.DateTimeFormat('fr-FR', { day:'2-digit', weekday:'long',year:'numeric', month: 'short'}, );
                        let date = new Date(json.dt*1000);
                        dateTxt.innerHTML = dtFormatDayOnly.format(date);
                    }
                )
            }
        );
        fetch(apiOneCall).then(
            function (response){
                response.json().then(
                    function (json) {
                        console.log(json.daily)
                        let dtFormatDayOnly = new Intl.DateTimeFormat('fr-FR', { weekday:'short'});
                        //les jours
                        console.log(json.daily.length);
                        for (i = 0; i<json.daily.length;i++){
                            let dateResponse =dtFormatDayOnly.format(new Date(json.daily[i].dt*1000));  
                            console.log(dateResponse)
                            dayTxt = `
                                    <div class="day">
                                        <h3>${dateResponse}</h3>
                                        <p>min : <span class="minday">${Math.floor(json.daily[i].temp.min)}°</span></p>
                                        <p>max : <span class="maxday">${Math.floor(json.daily[i].temp.max)}°</span></p>
                                    </div>
                            `;
                            weeklyTxt.insertAdjacentHTML("beforeend",dayTxt);                             
                        }
                    }
                )
            }
        )
    });
} else {
    alert("Veillez activer la geolocalisation pour utiliser l'application");
}