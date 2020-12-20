function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Clears community history
async function clear_community(debug = false) {
	let items = document.getElementsByClassName('style-scope yt-icon-button');
	let num_removed = 0;

	for(let i = 0; i < items.length; i++) {
		if(items !== undefined && items[i] !== undefined) {
			let dropdown_btn = items[i].firstElementChild;
			if(dropdown_btn !== null && dropdown_btn.hasAttribute('class') && 
			   dropdown_btn.className === 'style-scope ytd-menu-renderer') {
				if(debug) console.log(`[DEBUG 1] Targeting element ${i}.`);
				dropdown_btn.click();
				await sleep(150);
				
				let remove_btn = document.getElementsByClassName('yt-simple-endpoint style-scope ytd-menu-navigation-item-renderer')[0];
				if(remove_btn !== undefined && remove_btn.firstElementChild !== null && 
				   remove_btn.firstElementChild.lastElementChild !== null) {
					let remove_text = remove_btn.firstElementChild.lastElementChild.innerText;
					if(typeof remove_text === 'string') remove_text = remove_text.toLowerCase().trim();
					if(debug) console.log(`[DEBUG 2] Remove button's text is '${remove_text}'.`);
					if(remove_text === 'delete') {
						remove_btn.click();
						await sleep(150);
						
						let confirm_btn = document.getElementsByClassName('yt-simple-endpoint style-scope yt-button-renderer');
						if(confirm_btn !== undefined && confirm_btn.length === 2 && confirm_btn[1].firstElementChild !== null && 
						   confirm_btn[1].firstElementChild.firstElementChild !== null) {
							let confirm_text = confirm_btn[1].firstElementChild.firstElementChild.innerText;
							if(typeof confirm_text === 'string') confirm_text = confirm_text.toLowerCase().trim();
							if(debug) console.log(`[DEBUG 3] Confirm button's text is '${confirm_text}'.`);
							if(confirm_text === 'delete') {
								confirm_btn[1].click();
								await sleep(150);
								num_removed++;
							}
						}
					}
				}
			}
		}
	}
	console.log(`Successfully removed ${num_removed} items from your community history.`);
}

// There is a confirmation popup for first time deleters. This likely won't be an issue.
async function clear_livechat() {
	let items = document.querySelectorAll('[aria-label="Delete activity item"]');
	let num_removed = 0;
	
	for(let i = 0; i < items.length; i++) {
		if(items !== undefined && items[i] !== undefined) {
			let remove_btn = items[i];
			remove_btn.click();
			num_removed++;
			await sleep(250);
		}
	}
	if(document.querySelectorAll('[aria-label="Delete activity item"]').length !== items.length) {
		console.log(`[CONTINUE] Successfully removed ${num_removed} items. Detected more videos, so running the program again.`);
		await clear_livechat();
	} else {
		console.log(`[FINAL] Successfully removed ${num_removed} items from your livechat history.`);
	}
}