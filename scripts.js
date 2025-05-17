$(document).ready(function () {
    // Cached selectors
    const $select = $('#state-option');
    const $results = $('#results-container');
    const $quote = $('#quote-container');
    const $header = $('#header-img-container');
    const $selectContainer = $('#select-container');

    // States and their Abbreviations (fixed typos)
    const states = {
        "Alabama": "AL",
        "Alaska": "AK",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "California": "CA",
        "Colorado": "CO",
        "Connecticut": "CT",
        "Delaware": "DE",
        "Florida": "FL",
        "Georgia": "GA",
        "Hawaii": "HI",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        "Maine": "ME",
        "Maryland": "MD",
        "Massachusetts": "MA",
        "Michigan": "MI",
        "Minnesota": "MN",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        "Ohio": "OH",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Utah": "UT",
        "Vermont": "VT",
        "Virginia": "VA",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY"
    };

    // Populate the dropdown
    $.each(states, function (name, code) {
        $select.append(`<option value="${code}">${name}</option>`);
    });

    // Animate select container into position
    $selectContainer.animate({ top: '5rem' });

    // Handle state change
    $select.change(function () {
        const state = $(this).val();
        const stateName = $select.find(':selected').text();

        // Show loading
        $results.html('<div class="text-center my-5"><div class="spinner-border text-primary"></div></div>');

        const settings = {
            async: true,
            crossDomain: true,
            url: `https://jonahtaylor-national-park-service-v1.p.rapidapi.com/parks?stateCode=${state}`,
            method: 'GET',
            headers: {
                'X-Api-Key': 'jQ7m8si6dkYqrIte3yzMRg7HiNphMbome0xEpvFK',
                'X-RapidAPI-Key': '61d892bbb8mshdbd29002b04223fp128dbfjsn2819a769005f',
                'X-RapidAPI-Host': 'jonahtaylor-national-park-service-v1.p.rapidapi.com'
            }
        };

        $.ajax(settings).done(function (response) {
            $results.empty();

            // UI adjustments
            $results.css('margin-top', '350px');
            $quote.animate({ top: '-1rem' });
            $header.css('height', '400px');
            $selectContainer.animate({ top: '-2rem' });

            const parks = response.data;
            const numParks = parks.length;

            if (numParks === 0) {
                $results.html(`<p class="text-center mt-5">No parks found for ${stateName}.</p>`);
                return;
            }

            parks.forEach(parkInfo => {
                const {
                    parkCode,
                    fullName,
                    description,
                    url,
                    weatherInfo,
                    images,
                    latitude,
                    longitude
                } = parkInfo;

                const image = images.length > 0 ? images[0].url : '';
                const figCaption = images.length > 0 ? images[0].caption : 'Park image';

                const parkHTML = `
                    <div class="parkContainer p-3 mb-4 rounded">                    
                        <div class="row mb-3">
                            <div class="col-lg-4 text-center">
                                <figure>
                                    <img src="${image}" class="rounded mt-3 img-fluid" alt="image of ${fullName}">
                                    <figcaption class="mt-2">${figCaption}</figcaption>
                                </figure>
                            </div>
                            <div class="col-lg-8">
                                <a href="${url}"><h2 class="park-title my-3 text-center">${fullName}</h2></a>
                                <p>${description}</p>
                                <button class="btn btn-secondary mb-3" type="button" data-bs-toggle="offcanvas"
                                    data-bs-target="#${parkCode}" aria-controls="offcanvasTop">Get More Info ...</button>
                                <div class="offcanvas offcanvas-start text-bg-dark" tabindex="-1" id="${parkCode}"
                                    aria-labelledby="offcanvasTopLabel">
                                    <div class="offcanvas-header">
                                        <h1 class="offcanvas-title" id="offcanvasTopLabel">${fullName}</h1>
                                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"
                                            aria-label="Close"></button>
                                    </div>
                                    <div class="offcanvas-body">
                                        <h1 id="${parkCode}temp" class="text-center"></h1>
                                        <p class="text-center">Current Temperature at Location</p>
                                        <h3 class="mt-3">Weather Trends:</h3>
                                        <p>${weatherInfo}</p>
                                        <h3>Location:</h3>
                                        <p>${latitude}, ${longitude}</p>
                                        <iframe src="https://maps.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&amp;output=embed" class="text-center" width="100%" height="300" style="border:0;"></iframe>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                $results.append(parkHTML);

                // Fetch current temperature
                const tempSettings = {
                    async: true,
                    crossDomain: true,
                    url: `https://open-weather13.p.rapidapi.com/city/latlon/${latitude}/${longitude}`,
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': '61d892bbb8mshdbd29002b04223fp128dbfjsn2819a769005f',
                        'X-RapidAPI-Host': 'open-weather13.p.rapidapi.com'
                    }
                };

                $.ajax(tempSettings).done(function (tempResponse) {
                    const kTemp = tempResponse.main.temp;
                    const degF = ((kTemp - 273.15) * 9 / 5 + 32).toFixed(2);
                    $(`#${parkCode}temp`).text(`${degF} °F`);
                });
            });

            // Summary header
            $results.prepend(`<div><h4 class="blue my-5 pt-5 text-center">There are ${numParks} results for ${stateName}!</h4></div>`);
        }).fail(function (err) {
            $results.html(`<p class="text-center mt-5 text-danger">Failed to load park data. Please try again later.</p>`);
            console.error(err);
        });
    });
});
