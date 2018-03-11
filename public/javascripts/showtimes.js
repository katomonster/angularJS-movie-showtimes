// ===== ANGULAR JS ======== \\
const app = angular.module('ShowtimesApp', []);

app.service('metaDataService', function($http, $q) {
    this.fetchData = function () {
        return $http.get('json/movieMetaData.json')
        .then(function(response) {
            if (typeof response.data === 'object') {
                return response.data;
            } else {
                return $q.reject(response.data);
            }
        }, function() {
            return $q.reject(response.data);
        });
    };
});

app.service('showtimesService', function($http, $q) {
    this.fetchData = function () {
        return $http.get('json/movieShowtimes.json')
        .then(function(response) {
            if (typeof response.data === 'object') {
                return response.data;
            } else {
                return $q.reject(response.data);
            }
        }, function() {
            return $q.reject(response.data);
        });
    };
});

app.controller('ShowtimesController', ['$scope', 'metaDataService', 'showtimesService', function ($scope, metaDataService, showtimesService) {

    $scope.getMovieData = function(data) {
        let movieData = [];

        $scope.movieMetaData = data[0];
        $scope.movieShowtimes = data[1];

        $scope.movieShowtimes.forEach((theater) => {
            const showtimes = theater.showtimes;
            const movieIds = Array.from(Object.keys(showtimes));
            let movieArr = [];
            movieIds.forEach((id, i) => {
                $scope.movieMetaData.forEach((data) => {
                    if (id === data.id) {
                        movieArr.push({title: data.title, rating: data.rating, poster: data.poster, showtimes: $scope.getShowtimes(showtimes[id])});
                    }
                });
            });
            movieData.push({ name: theater.name, movieInfo: movieArr.sort((a, b) => a.title.localeCompare(b.title)) });  
        });
        
        $scope.data = movieData;
        $scope.selectedData = movieData[0].movieInfo;
        $scope.fullSelectedData = movieData[0].movieInfo;
        $scope.selectedTheater = $scope.slugify(movieData[0].name);
    };

    $scope.slugify = function(str) {
        return str.toLowerCase().replace(/\s/g, "-");
    };

    $scope.getShowtimes = function(showtimes) {
        return showtimes.map((time) => {
            const split = time.split(" ");
            const amPm = split[1];
            const hm = split[0].split(":");
            const hour = amPm === "am" ? parseInt(hm[0], 10) * 60 : (parseInt(hm[0], 10) + 12) * 60;
            const min = parseInt(hm[1], 10);
            const startTime = hour + min;
            return {formatted: time, number: startTime};
        }).sort((a, b) => a.number - b.number);
    };
	
	$scope.setCurrentData = function(name) {
        let movieInfo;
        let movieTheater;

        //console.log(data.name, name);

        $scope.data.forEach((data)=> {
            if (data.name === name) {
                movieInfo = data.movieInfo;
                movieTheater = $scope.slugify(data.name);
            }
        });

        $scope.selectedData = movieInfo,
        $scope.fullSelectedData = movieInfo,
        $scope.selectedTheater = movieTheater
    };

	$scope.searchMovie = function(val) {
	    let matches = [];

	    for (const data of $scope.selectedData) {
	        if (val && val === data.title.toLowerCase().slice(0, val.length)) {
	            matches.push(data);
	        }
	    }

	    if (matches.length) {
	        $scope.selectedData = matches;
	    } else {
	        $scope.selectedData = $scope.fullSelectedData;
	    }
	};

	$scope.getNavClass = function (a, b) {
		return $scope.slugify(a) == $scope.slugify(b) ? 'active' : '';
	};

	$scope.getTimeClass = function(showtime) {
		const hour = new Date().getHours() * 60;
	    const min = new Date().getMinutes();
	    const curtime = (hour + min);
	    return showtime.number < curtime ? 'time--past' : '';
	}

    $scope.getJson = function() {
        const promise1 = metaDataService.fetchData();
        const promise2 = showtimesService.fetchData();

        Promise.all([promise1, promise2])
        .then((data) => {
            $scope.getMovieData(data);
        })
        .catch((err) => {
            console.log(err);
        });
    }

    $scope.getJson();
}]);
