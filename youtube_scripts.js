async function run_all() {
	await load_all();
	await clean_playlist();
	await location.reload();
	await load_all();
	await get_unique_channels();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Load all videos
async function scroll_down() {
	const num_videos = document.getElementById('stats').firstElementChild.firstElementChild.innerText;
	const num_loads = Math.round(parseInt(num_videos.replace(',', '')) / 100);
	
	console.log(`Detected ${num_videos} videos. Calculating that ${num_loads} loads are required.`);
	
	for(let i = 0; i < num_loads; i++) {
		let prev_height = document.querySelectorAll('ytd-app')[0].offsetHeight;
		let curr_height = prev_height;
		
		while(prev_height === curr_height) {
			window.scrollTo(0, curr_height);
			await sleep(500);
			curr_height = document.querySelectorAll('ytd-app')[0].offsetHeight;
			if(i === num_loads - 1) {
				window.scrollTo(0, curr_height); 
				console.log(`Completed loads. Exiting scroll function...`);
				return;
			}
		}
	}
}

// Only run load_all() when devtools isn't open (devtools makes loading very slow)
async function load_all() {
	var element = new Image;
	var devtoolsOpen = false;
	element.__defineGetter__("id", function() {
		devtoolsOpen = true; // This only executes when devtools is open.
	});
	
	let loop = true;
	while(loop) {
		devtoolsOpen = false;
		console.log(element);
		console.clear();
		if(!devtoolsOpen) {
			loop = false;
			console.log(`Devtools closed. Starting loading process...`);
			await scroll_down();
		}
		await sleep(1000);
	}
}


// Delete all loaded videos from channel [String] -> 'bad_channel'
async function remove_video(bad_channels) {
	const is_liked_playlist = (document.getElementsByClassName('yt-simple-endpoint style-scope yt-formatted-string')[0].innerText === 'Liked videos');
	const title_index_start = (is_liked_playlist) ? 2 : 1;
	const icon_index_start = (is_liked_playlist) ? 9 : 11;
	const remove_btn_index = (is_liked_playlist) ? 3 : 0;
	
	let num_loaded_items = document.querySelectorAll('yt-icon-button').length;
	if(num_loaded_items > 112) {
		console.log("Left menu is open, interfering with the program. Please close it and try again.");
		return
	}
	(is_liked_playlist) ? num_loaded_items -= 12 : num_loaded_items -= 9;
	
	var total_removed_videos = 0;
    
    for(let i = 0; i < num_loaded_items; i++) {
		let bad_video_check = document.getElementsByClassName('style-scope ytd-playlist-video-renderer')[16 * i + 9];
		if(bad_video_check !== undefined && (bad_video_check.title === '[Private video]' || bad_video_check.title === '[Deleted video]')) {
			console.log(`Bad video of type ${bad_video_check} detected at index [${i + 1}]`);
			return;
		}
		
		let title = document.getElementsByClassName('yt-simple-endpoint style-scope yt-formatted-string')[i + title_index_start];
		if(title !== undefined && bad_channels.includes(title.innerText)) {
			let dropdown_btn = document.querySelectorAll('yt-icon-button')[i + icon_index_start];
			dropdown_btn.click();
			
			await sleep(250);
			
			let remove_btn = document.querySelectorAll('ytd-menu-service-item-renderer')[remove_btn_index];
			remove_btn.click();
			
			let description = document.getElementsByClassName('style-scope ytd-playlist-video-renderer')[7 + 16 * i];
			(description !== undefined) ? description = description.innerText : description = "unavailable";
			console.log(`[${i + 1}] Removed video "${description.trim()}" by channel ${title.innerText}`);
			total_removed_videos += 1;
		}
	}
	console.log(`Removed a total of ${total_removed_videos} videos after going through ${num_loaded_items} loaded videos. Please refresh to see the results.`);
}

// Delete all loaded private or deleted videos from playlist
async function clean_playlist() {
	const is_liked_playlist = (document.getElementsByClassName('yt-simple-endpoint style-scope yt-formatted-string')[0].innerText === 'Liked videos');
	const title_index_start = (is_liked_playlist) ? 2 : 1;
	const icon_index_start = (is_liked_playlist) ? 9 : 11;
	const remove_btn_index = (is_liked_playlist) ? 0 : 3;
	
	let num_loaded_items = document.querySelectorAll('yt-icon-button').length;
	if(num_loaded_items > 112) {
		console.log("Left menu is open, interfering with the program. Please close it and try again.");
		return
	}
	(is_liked_playlist) ? num_loaded_items -= 12 : num_loaded_items -= 9;
	
	var total_removed_videos = 0;
    
    for(let i = 0; i < num_loaded_items; i++) {
		let bad_video_check = document.getElementsByClassName('style-scope ytd-playlist-video-renderer')[16 * i + 9];
		if(bad_video_check !== undefined && (bad_video_check.title === '[Private video]' || bad_video_check.title === '[Deleted video]')) {
			let dropdown_btn = document.querySelectorAll('yt-icon-button')[i + icon_index_start];
			dropdown_btn.click();
			
			await sleep(500);
			
			let remove_btn = document.querySelectorAll('ytd-menu-service-item-renderer')[remove_btn_index];
			if(remove_btn.firstElementChild.lastElementChild.innerText.split(" ")[0] === "Remove") remove_btn.click();
			
			console.log(`Removed bad video of type ${bad_video_check} detected at index [${i + 1}]`);
			total_removed_videos += 1;
		}
		// console.log(`Skipping [${i}]`);
	}
	console.log(`Removed a total of ${total_removed_videos} videos after going through ${num_loaded_items} loaded videos. Please refresh to see the results.`);
}

// Get list of unique channels in playlist
async function get_unique_channels() {
	const is_liked_playlist = (document.getElementsByClassName('yt-simple-endpoint style-scope yt-formatted-string')[0].innerText === 'Liked videos');
	const title_index_start = (is_liked_playlist) ? 2 : 1;
	const icon_index_start = (is_liked_playlist) ? 9 : 11;
	const remove_btn_index = (is_liked_playlist) ? 0 : 3;
	
	let num_loaded_items = document.querySelectorAll('yt-icon-button').length;
	if(num_loaded_items > 112) {
		console.log("Left menu is open, interfering with the program. Please close it and try again.");
		return
	}
	(is_liked_playlist) ? num_loaded_items -= 12 : num_loaded_items -= 9;
	
	var total_removed_videos = 0;
	var unique_channels = {};
    
    for(let i = 0; i < num_loaded_items; i++) {
		let bad_video_check = document.getElementsByClassName('style-scope ytd-playlist-video-renderer')[16 * i + 9];
		if(bad_video_check !== undefined && (bad_video_check.title === '[Private video]' || bad_video_check.title === '[Deleted video]')) {
			console.log(`Bad video of type ${bad_video_check} detected at index [${i + 1}]`);
			return;
		}
		
		let title = document.getElementsByClassName('yt-simple-endpoint style-scope yt-formatted-string')[i + title_index_start];
		if(title !== undefined) {
			unique_channels[title.innerText] = (unique_channels[title.innerText] === undefined) ? 1 : unique_channels[title.innerText] + 1;
		}
	}
	console.log(`Found ${Object.keys(unique_channels).length} unique channels. Listing them...`);
	const sorted_channels = Object.keys(unique_channels).sort(function (a, b) { return unique_channels[b] - unique_channels[a]; });
	const threshold = 3;
	for(let entry of sorted_channels) {
		if(unique_channels[entry] >= threshold) console.log(`${entry}: ${unique_channels[entry]} times.`);
	}
}

async function print_titles() {
	await load_all();
	console.clear();
	
	const items = document.getElementsByClassName('style-scope ytd-playlist-video-renderer');
	let index = 1;
	let saved_string = `[CURRENT DATE]: ${new Date()}\n`;
	
	if(items !== undefined || items !== null) {
		for(let i = 0; i < items.length; i++) {
			if(items[i] !== undefined && items[i].hasAttribute('title') && items[i].title !== undefined) {
				saved_string += `[${index++}] ${items[i].title}\n`;
			}
		}
	} else {
		console.log(`ERROR: Tried to find items, but got ${items}`);
	}
	console.log(saved_string);
}