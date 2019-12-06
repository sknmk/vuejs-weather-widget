const weatherIcon = Vue.component('weather-icon', {
	props: ['condition'],
	template: '<i v-bind:class="{\'lni-rain\' : condition == \'Rain\',\'lni-cloud\' : condition == \'Clouds\',\'lni-sun\' : condition == \'Clear\'}"></i>',
});

const weatherApp = new Vue({
	el: '#weatherContainer',
	components: {
		weatherIcon: weatherIcon,
	},
	data: {
		api: {
			url: 'https://api.openweathermap.org/data/2.5/forecast',
			queryString: '',
			response: '',
		},
		weather: {
			condition: '',
			temperature: '',
			humidity: '',
			pressure: '',
			wind: ''
		},
		forecast: {data: []},
		location: {
			country: '',
			city: '',
			latitude: '',
			longitude: '',
			mapUrl: '',
		},
	},
	mounted() {
		this.getCoordinates().then(location => {
			this.location.latitude = location.coords.latitude;
			this.location.longitude = location.coords.longitude;
			this.api.queryString =
					'?lat=' + this.location.latitude
					+ '&lon=' + this.location.longitude
					+ '&appid=14997fa1e626b48fe38be1f7fa76f635';
			this.getWeatherData();
		}).catch(function(exception){
			console.log(excepiton);
			alert("Konum bilgisi alınamadı.")
		});
	},
	methods: {
		getCoordinates() {
			if ('geolocation' in navigator === false) {
				console.log('Geolocation is not available.');
				return false;
			}
			return new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(position => {
					resolve(position);
				}, error => {
					reject(error);
				});
			});

		},
		getWeatherData() {
			axios.get(this.api.url + this.api.queryString).then(response => {
				this.api.response = response.data;
				this.parseCurrentWeatherData();
				this.parseForecastWeatherData();
			}).catch(error => {
				console.log(error);
			});
		},
		setDefaultLocation() {
			this.location.city = this.api.response.city.name;
			this.location.country = this.api.response.city.country;
		},
		parseCurrentWeatherData() {
			this.setDefaultLocation();
			this.weather.condition = this.api.response.list[0].weather[0].main;
			this.weather.humidity = this.api.response.list[0].main.humidity;
			this.weather.pressure = this.api.response.list[0].main.pressure;
			this.weather.wind = this.api.response.list[0].wind.speed;
			this.weather.temperature
					= Number((this.api.response.list[0].main.temp - 273.15)
					.toFixed(1));
		},
		parseForecastWeatherData() {
			let forecastData = {};
			this.api.response.list.forEach(function(day, i) {
				let dataDate = new Date(day.dt_txt);
				if (dataDate.getHours() == 12) {
					forecastData[i] = {
						date: dataDate.getDate() + '.' + dataDate.getMonth(),
						temperature: Number(day.main.temp - 273.15).toFixed(0),
						condition: day.weather[0].main,
					};
				}

			});
			this.forecast.data = forecastData;
		},
		createMap() {
			let mapUrl = 'https://www.bing.com/maps/embed?h=330&cp=' +
					this.location.latitude + '~' + this.location.longitude +
					'&lvl=12&typ=d&sty=r&src=SHELL&FORM=MBEDV8';
			let mapDom = document.createElement('iframe');
			mapDom.setAttribute('src', mapUrl);
			mapDom.setAttribute('id', 'widgetMap');
			mapDom.setAttribute('width', '100%');
			mapDom.setAttribute('height', '300px');
			mapDom.setAttribute('scrolling', 'no');
			mapDom.setAttribute('frameborder', '0');
			mapDom.setAttribute('class', 'rounded shadow-2');

			document.getElementById('mapContainer').appendChild(mapDom);
		},
	},
	updated: function() {
		this.createMap();
	},
});
