
function showVideoModal(video) {
    // get button to show modal
    let showVideoModalButton = document.getElementById('showVideoModalButton');
    // get the video modal body
    let videoModalBody = document.getElementById('videoModalBody');
    // clear the video modal body
    videoModalBody.innerHTML = '';
    // create a container
    let container = document.createElement('div');
    // set the container classes
    container.classList.add('container');
    // add the container to the video modal body
    videoModalBody.appendChild(container);
    // add channel id and video id to the container
    container.setAttribute('data-channel-id', video.channelId);
    container.setAttribute('data-video-id', video.videoId);
    let ids = document.createElement('p');
    ids.classList.add('text-muted');
    ids.innerHTML = 
    `<strong>Video ID:</strong> ${video.video_id} ` + 
    `<a href="https://www.youtube.com/watch?v=${video.video_id}" target="_blank" class="text-muted"><i class="fa-solid fa-arrow-up-right-from-square"></i></a><br>` + 
    `<strong>Channel ID:</strong> ${video.channel_id}<br>` + 
    `<strong>Publish Date:</strong> ${new Date(video.published_at).toLocaleString()}<br>`;
    container.appendChild(ids);
    // create an image
    let image = document.createElement('img');
    // set the image src
    image.src = video.url;
    // set the image alt
    image.alt = video.title;
    image.style.width = 'inherit';    
    // add the image to the video modal body
    container.appendChild(image);
    // display the details of the video
    let h5 = document.createElement('h5');
    h5.style.wordBreak = 'break-all';
    h5.innerText = video.title;    
    container.appendChild(h5);

    // description
    let p = document.createElement('p');
    p.classList.add('text-muted');
    p.style.wordBreak = 'break-all';
    p.innerText = video.description;
    // add the description to the video modal body
    container.appendChild(p);

    // show video modal
    showVideoModalButton.click();
}

// creates a video card
function createVideoCard(video) {
    // add a card
    let card = document.createElement('div');
    // set the card classes
    card.classList.add('card');
    card.classList.add('shadow-sm');
    // all cards must be of the same height
    card.style.height = '100%';
    // create an image
    let image = document.createElement('img');
    // set the image classes
    image.classList.add('card-img-top');
    // set the image src
    image.src = video.url;
    // set the image alt
    image.alt = video.title;
    // inherit width
    // add the image to the card
    card.appendChild(image);
    // set the image classes
    // add a card body
    let cardBody = document.createElement('div');
    // set the card body classes
    cardBody.classList.add('card-body');
    // add the card body to the card
    card.appendChild(cardBody);
    // add a card title
    let cardTitle = document.createElement('h5');
    // set the card title classes
    cardTitle.classList.add('card-title');
    cardTitle.classList.add('text-truncate-3');
    cardTitle.style.cursor = 'pointer';
    cardTitle.onclick = () => showVideoModal(video);
    // truncate the title
    // set the card title text
    cardTitle.innerText = video.title;
    // add the card title to the card body
    cardBody.appendChild(cardTitle);
    // add published at
    let publishedAt = document.createElement('p');
    // set the published at classes
    publishedAt.classList.add('card-text');
    publishedAt.classList.add('mt-3');
    publishedAt.classList.add('text-muted');
    publishedAt.style.textAlign = 'right';
    // set the published at text
    publishedAt.innerText = `Published at: ${timeDifference(new Date(), new Date(video.published_at))}`
    // add the published at to the card body
    cardBody.appendChild(publishedAt);
    
    // return the card
    return card;
}

// shows the videos on UX
function showVideosUX(videos) {
    // get the container
    let videosContainer = document.getElementById('videos');
    // clear the container
    videosContainer.innerHTML = '';
    // check if there are any videos
    if (videos.length > 0) {
        // add a row
        let row = document.createElement('div');        
        // set the row classes
        row.classList.add('row');
        row.classList.add('mt-5');
        // add the row to the container
        videosContainer.appendChild(row);
        // loop through the videos
        for (let video of videos) {
            // add a column
            let col = document.createElement('div');
            col.classList.add('col-lg-3');
            col.classList.add('col-md-4');
            col.classList.add('col-sm-6');
            col.classList.add('mb-4');
            // add the column to the row
            row.appendChild(col);
            // create a video card
            let card = createVideoCard(video);
            // add the card to the column
            col.appendChild(card);
        }
    } else {
        // create a message
        let message = document.createElement('p');
        // set the message classes
        message.classList.add('text-center');
        message.classList.add('text-muted');
        message.classList.add('mt-5');
        // set the message text
        message.innerText = 'No videos found';
        // add the message to the container
        videosContainer.appendChild(message);
    }
}

// load videos from the server
function loadVideos(params) {
    // set teh default parameters
    if(!params.has('limit')) params.set('limit', 10);
    if(!params.has('page')) params.set('page', 1);
    if(!params.has('order')) params.set('order', 'DESC');
    if(!params.has('thumbnailSize')) params.set('thumbnailSize', 'HIGH');
    // create AJAX request
    const xhr = new XMLHttpRequest();
    // set the request method and url
    xhr.open('GET', `/api?${params}`);
    // set the request headers
    xhr.setRequestHeader('Content-Type', 'application/json');
    // set the request handler
    xhr.onload = function() {
        // check the status code
        if (xhr.status === 200) {
            // parse the response
            const response = JSON.parse(xhr.responseText);
            // show the videos on UX
            showVideosUX(response.videos);
        } else {
            // log the error
            console.log('Error loading videos', xhr);
        }
        // /javascripts/loader.js
        hideLoader();
    }
    // set the error handler
    xhr.onerror = function() {
        // log the error
        console.log('Error loading videos', xhr);
        // /javascripts/loader.js
        hideLoader();
    }
    // send the request
    xhr.send();
}

function preFillFormAttributes(params) {
    if (params.has('search')) {
        document.getElementById('search').value = params.get('search');
    }
    if (params.has('limit')) {
        document.getElementById('limit').value = params.get('limit');
    }
    if (params.has('order')) {
        document.getElementById('order').value = params.get('order');
    }
    if (params.has('publishedAfter')) {
        document.getElementById('publishedAfter').value = params.get('publishedAfter');
    }
    if (params.has('publishedBefore')) {
        document.getElementById('publishedBefore').value = params.get('publishedBefore');
    }
}

// load videos when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    // get the query parameters
    const params = new URLSearchParams(window.location.search);
    // pre-fill form attributes with query parameters
    preFillFormAttributes(params);
    // load the videos
    loadVideos(params);
});