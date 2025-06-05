"use strict";

async function loadHomeScreen() {
    const baseUrl = `https://api.coingecko.com/api/v3/coins/`;
    const cryptoExtListUsd = `markets?vs_currency=usd`;

    try {
        const cryptoList = await getCryptoCurrency(`${baseUrl}${cryptoExtListUsd}`);
        const container = document.getElementById('cryptoListContainerDiv');
        displayList(cryptoList, baseUrl, container);
        searchCoin(cryptoList, baseUrl, container);
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
}

// Fetches cryptocurrency data from a given URL
async function getCryptoCurrency(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`❌ Failed to fetch data`);
    }
    return await response.json();
}

// Dynamically builds and displays a list of crypto cards
function displayList(cryptoList, baseUrl, container) {
    cryptoList.forEach((coin) => {
        const cardRoot = document.createElement(`div`);
        const cardFlipper = document.createElement(`div`);
        const cardFrontFace = document.createElement(`div`);
        const cardBackFace = document.createElement(`div`);
        const backFaceContent = document.createElement(`div`);
        const showMoreBtn = document.createElement(`button`);
        showMoreBtn.className = `showMoreInfoBtn`;
        showMoreBtn.textContent = `Show more info`;
        cardRoot.className = `cardRoot`;
        cardFlipper.className = `cardFlipper`;
        cardFrontFace.className = `cardFrontFace`;
        cardBackFace.className = `cardBackFace`;
        backFaceContent.className = `backFaceContent`;
        cardBackFace.appendChild(backFaceContent);
        cardFlipper.appendChild(cardFrontFace);
        cardFlipper.appendChild(cardBackFace);
        cardRoot.appendChild(cardFlipper);
        container.appendChild(cardRoot);
        buildFrontContent(cardFrontFace, coin, showMoreBtn);
        attachFlipLogic(backFaceContent, cardRoot, coin, baseUrl, showMoreBtn);
    });
}

// Constructs the front face of each crypto card and sets toggle logic
function buildFrontContent(cardFrontFace, coin, showMoreBtn) {
    const cryptoListItemIcon = document.createElement(`img`);
    const cryptoListItemSymbol = document.createElement(`p`);
    const cryptoListItemName = document.createElement(`p`);
    const toggleWrapper = document.createElement(`label`);
    const toggleCheckbox = document.createElement(`input`);
    const toggleVisualTrack = document.createElement(`div`);
    toggleWrapper.className = `toggleWrapper`;
    toggleCheckbox.className = `toggleCheckbox`;
    toggleCheckbox.type = `checkbox`;
    toggleCheckbox.setAttribute(`data-coin-id`, coin.id);
    toggleVisualTrack.className = `toggleVisualTrack`;

    // Check if coin is already saved
    let saved = false;
    for (let savedCoin of getSavedCurrencies()) {
        if (savedCoin.id === coin.id) {
            saved = true;
            break;
        }
    }
    toggleCheckbox.checked = saved;
    // Populate front content
    cryptoListItemIcon.src = coin.image;
    cryptoListItemSymbol.innerHTML = coin.symbol.toUpperCase();
    cryptoListItemName.innerHTML = coin.name;

    // Handle toggle (add/remove coin)
    toggleCheckbox.addEventListener(`change`, async () => {
        try {
            if (toggleCheckbox.checked) {
                let updatedCoinsList = getSavedCurrencies();
                let alreadyExists = updatedCoinsList.some(item => item.id === coin.id);
                if (!alreadyExists) {
                    if (updatedCoinsList.length < 5) {
                        updatedCoinsList.push(coin);
                        localStorage.setItem(`coins`, JSON.stringify(updatedCoinsList));
                    } else {
                        toggleCheckbox.checked = false;
                        await displayDialog(true);
                        new Error(`❌ You can select up to 5 coins only`);
                    }
                }
            } else {
                let currentCoins = getSavedCurrencies();
                let newCurrencyList = currentCoins.filter(item => item.id !== coin.id);
                localStorage.setItem('coins', JSON.stringify(newCurrencyList));
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
        }
    });
    // Append elements
    toggleWrapper.appendChild(toggleCheckbox);
    toggleWrapper.appendChild(toggleVisualTrack);
    cardFrontFace.appendChild(toggleWrapper);
    cardFrontFace.appendChild(cryptoListItemIcon);
    cardFrontFace.appendChild(cryptoListItemSymbol);
    cardFrontFace.appendChild(cryptoListItemName);
    cardFrontFace.appendChild(showMoreBtn);
}

// Handles the flip logic and renders the back face with live data
function attachFlipLogic(backFaceContent, cardRoot, coin, baseUrl, showMoreBtn) {
    const showLessInfoBtn = document.createElement(`button`);
    showLessInfoBtn.className = `showLessInfoBtn`;
    showLessInfoBtn.textContent = `Less`;
    showLessInfoBtn.addEventListener(`click`, () => {
        //remove customFlip word from class name when to flip back
        cardRoot.classList.remove(`customFlip`);
    });

    // Show more info (flip card and load data)
    showMoreBtn?.addEventListener("click", async () => {
        if (cardRoot.classList.contains(`customFlip`)) return;
        try {

            const data = await getCryptoCurrency(`${baseUrl}${coin.id}`);
            const prices = data.market_data.current_price;
            backFaceContent.innerHTML = `
                <p><strong>${data.name}</strong></p>
                <p><strong>${formatPrices(prices.usd)} $</strong></p>
                <p><strong>${formatPrices(prices.eur)} €</strong></p>
                <p><strong>${formatPrices(prices.ils)} ₪</strong></p>
            `;
            backFaceContent.appendChild(showLessInfoBtn);
            requestAnimationFrame(() => {
                //adding the keyword 'customFlip' to the name of the class so that it will behave differently (flip) later
                //option to remove this word when not needing to flip
                cardRoot.classList.add(`customFlip`);
            });
        } catch (err) {
            throw new Error(`❌ Failed to load coin info`);
        }

        // Artificial delay for smoother animation
    });
}

// Displays a modal dialog, optionally with a list of selected coins
async function displayDialog(isListGonnaBeUpdated) {
    const dialog = document.createElement(`dialog`);
    const form = document.createElement(`form`);
    dialog.appendChild(form);
    document.body.appendChild(dialog);
    const list = document.createElement(`div`);
    list.className = `list`;
    form.appendChild(list);
    const closeDialog = document.createElement(`button`);
    closeDialog.type = "button";
    closeDialog.textContent = `X`;
    form.appendChild(closeDialog);
    closeDialog.addEventListener(`click`, () => {
        dialog.close()
    });

    if (isListGonnaBeUpdated) {
        updateHtml(list, dialog);
    } else {
        list.innerHTML = `<strong><p>No matching results</p></strong>`;
    }

    dialog.showModal();
}

// Updates HTML of dialog with saved coins
function updateHtml(list, dialog) {
    const checkedCoins = getSavedCurrencies();
    invokeDialog(list, checkedCoins);
    manageDeleteCoins(list, dialog);
}

// Renders each saved coin inside the dialog
function invokeDialog(list, checkedCoins) {
    let html = `<strong><p>You can select up to five coins. Remove a coin</p></strong>`;
    checkedCoins.forEach((coin, index) => {
        html += `
        <div class="coinToDeleteDiv" id="coinToDeleteDiv-${index}">
            <i class="bi bi-trash2-fill" style="cursor:pointer" data-id="${coin.id}"></i>
            <p><img src="${coin.image}"></p>
            <p>${coin.name}</p>
        </div>`;
    });
    list.innerHTML = html;
}

// Adds event listeners to trash icons in the dialog to remove coins
function manageDeleteCoins(list, dialog) {
    const deleteIcons = list.querySelectorAll('.bi-trash2-fill');

    deleteIcons.forEach((icon) => {
        icon.addEventListener('click', () => {
            const coinId = icon.getAttribute('data-id');
            const updatedList = getSavedCurrencies().filter(coin => coin.id !== coinId);
            localStorage.setItem('coins', JSON.stringify(updatedList));

            const toggle = document.querySelector(`.toggleCheckbox[data-coin-id="${coinId}"]`);
            if (toggle) toggle.checked = false;

            if (updatedList.length === 0) {
                dialog.close();
            } else {
                updateHtml(list, dialog);
            }
        });
    });
}

// Formats price as a locale string without decimals
function formatPrices(price) {
    return price.toLocaleString('en-US', {
        maximumFractionDigits: 0
    });
}

// Handles real-time search input and filters the displayed crypto list
function searchCoin(coins, baseUrl, container) {
    const input = document.getElementById("searchInput");
    input?.addEventListener("input", async (event) => {
        const target = event.target;
        const typedValue = target.value.toLowerCase().trim();

        if (typedValue.length > 1) {
            let matchFound = false;
            let foundCards = [];

            for (const coin of coins) {
                const name = coin.name.toLowerCase();
                const symbol = coin.symbol.toLowerCase();

                if (name.includes(typedValue) || symbol.includes(typedValue)) {
                    foundCards.push(coin);
                    matchFound = true;
                }
            }
            container.innerHTML = '';
            if (matchFound) {
                displayList(foundCards, baseUrl, container);
            } else if (typedValue.length > 4) {
                await displayDialog(false);
            }
        } else {
            container.innerHTML = '';
            displayList(coins, baseUrl, container);
        }
    });
}

// Retrieves the list of saved coins from localStorage
function getSavedCurrencies() {
    const json = localStorage.getItem(`coins`);
    let coinsList = [];
    if (json) {
        coinsList = JSON.parse(json);
    }
    return coinsList;
}

const liveUrl = `https://min-api.cryptocompare.com/data/`

// Loads the chart screen and creates real-time updating candlestick charts for selected coins
async function loadChartScreen(format, data) {
    const savedCryptoItems = getSavedCurrencies();
    let cryptoSymbols = [];
    savedCryptoItems.forEach(item => {
        cryptoSymbols.push(item.symbol);
    });
    const emptyStateMessage = document.getElementById(`emptyStateMessage`)
    const chartContainer = document.getElementById(`chartContainer`)
    if (savedCryptoItems.length === 0) {
        emptyStateMessage.innerText = emptyStateMessage.innerHTML = `No saved currencies to track. \n To view live chart please select the requested crypto currency`
        chartContainer.style.visibility = "hidden";
    } else {
        emptyStateMessage.innerText = ``
        chartContainer.style.visibility = "visible";
    }

// Maps an array of symbols into a comma-separated string for future API usage
    function mapCryptoValues(arr) {
        let newStrings = ``;
        arr.map((symbol, index) => {
            if (index !== arr.length - 1) {
                newStrings += symbol + `,`;
            } else newStrings += symbol;
        });
        return newStrings;
    }

    // Updates chart data every second with the latest prices
    setInterval(async () => {
        for (const item of cryptoSymbols) {
            // Get current prices for all selected crypto symbols
            let predictionResponse = await getCryptoCurrency(`${liveUrl}pricemulti?tsyms=usd&fsyms=${mapCryptoValues(cryptoSymbol)}`);
            const price = predictionResponse[item]?.USD;
            // Update the chart if valid data and chart exists
            if (price && chartMap[item]) {
                chartMap[item].series.update({
                        time: Math.floor(Date.now() / 1000),
                        open: price,
                        high: price,
                        low: price,
                        close: price
                    }
                );
            }
        }
    }, 1000);

    //reference the chart for updating later
    const chartMap = {};
    const container = document.getElementById("liveChartsContainer");

    //Create a chart for each saved cryptocurrency
    for (const item of savedCryptoItems) {
        const singleCardContainer = document.createElement("div");
        // creating an HTML container with title and chart div
        singleCardContainer.innerHTML = `
            <div class="chartWrapper">
    <h4>${item.name}</h4>
    <div id="chart-${item.symbol}" class="candlestickChart"></div>
             </div>`;
        container.appendChild(singleCardContainer);

        // create the actual individual Chart
        const chart = LightweightCharts.createChart(`chart-${item.symbol}`, {
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                borderVisible: false // hiding the bottom ugly default border
            },
            rightPriceScale: {
                borderVisible: false, // hiding the right side ugly default border
            }
        });
        //formatting the time
        chart.applyOptions({
            timeScale: {
                timeVisible: true,
                tickMarkFormatter: (timestamp) => {
                    const date = new Date(timestamp * 1000); // converting seconds to mili seconds
                    return date.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                }
            }
        });

        // creating a candlestick with  prices
        const series = chart.addCandlestickSeries({
            priceFormat: {
                type: 'custom',
                formatter: price => `${formatPrices(price)} $` // adding $ dollar symbol to the prices
            }
        });
        //storing the chart for future reference
        chartMap[item.symbol] = {chart, series};
        //setting initial chart data from API - built in library function
        series.setData(await fetchCandles(item.symbol), data);
    }
}

//fetching 5 most recent candlestick data points for the given symbol
async function fetchCandles(symbol) {
    const response = await fetch(`${liveUrl}v2/histominute?fsym=${symbol}&tsym=USD&limit=5`);
    const body = await response.json();
    //returning the array of the candlesticks formatted
    return body.Data.Data.map(item => (
            {
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close
            }
        )
    );
}