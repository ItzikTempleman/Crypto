"use strict";

// Retrieves the list of saved coins from localStorage
function getSavedCurrencies() {
    const json = localStorage.getItem(`coins`);
    let coinsList = [];
    if (json) {
        coinsList = JSON.parse(json);
    }
    return coinsList;
}

// Loads the home screen: adds parallax scroll effect, fetches coins, and renders list with search
async function loadHomeScreen() {
    const baseUrl = `https://api.coingecko.com/api/v3/coins/`;
    const cryptoExtListUsd = `markets?vs_currency=usd`;
    window.addEventListener('scroll', () => {
        let background = document.querySelector('.parallaxBackground');
        background.style.transform = `translateY(${window.scrollY * 0.8}px)`;
    });
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
    showLessInfoBtn.textContent = `Show less info`;
    showLessInfoBtn.addEventListener(`click`, () => {
        cardRoot.classList.remove(`customFlip`);
    });

    // Show more info (flip card and load data)
    showMoreBtn?.addEventListener("click", async () => {
        if (cardRoot.classList.contains(`customFlip`)) return;
        try {
            await delay(600);
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
                cardRoot.classList.add(`customFlip`);
            });
        } catch (err) {
            throw new Error(`❌ Failed to load coin info`);
        }

        // Artificial delay for smoother animation
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    });
}

// Displays a modal dialog, optionally with list of selected coins
async function displayDialog(toUpdateList) {
    const dialog = document.createElement(`dialog`);
    const form = document.createElement(`form`);
    dialog.appendChild(form);
    document.body.appendChild(dialog);

    const list = document.createElement(`div`);
    list.className = `list`;
    form.appendChild(list);

    const closeDialog = document.createElement(`button`);
    closeDialog.textContent = `X`;
    form.appendChild(closeDialog);
    closeDialog.addEventListener(`click`, () => dialog.close());

    if (toUpdateList) {
        updateHtml(list, dialog);
    } else {
        list.innerHTML = `<strong><p>No matching results</p></strong>`;
    }

    dialog.showModal();
}

// Updates HTML of dialog with saved coins
function updateHtml(list, dialog) {
    const checkedCoins = getSavedCurrencies();
    callDialog(list, checkedCoins);
    manageDeleteCoins(list, dialog);
}

// Renders each saved coin inside the dialog
function callDialog(list, checkedCoins) {
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

// Adds event listeners to trash icons in dialog to remove coins
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

        if (typedValue.length > 2) {
            let matchFound = false;
            let foundCards = [];

            for (const coin of coins) {
                if (coin.name.toLowerCase().includes(typedValue) || coin.symbol.toLowerCase().includes(typedValue)) {
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

// Loads the chart screen and creates real-time updating candlestick charts for selected coins
async function loadChartScreen() {
    const cryptoItems = getSavedCurrencies();
    let cryptoSymbol = [];
    cryptoItems.forEach(item => {
        cryptoSymbol.push(item.symbol);
    });

    setInterval(async () => {
        let predictionResponse = await getCryptoCurrency(`https://min-api.cryptocompare.com/data/pricemulti?tsyms=usd&fsyms=${mapCryptoValues(cryptoSymbol)}`);
        const now = Math.floor(Date.now() / 1000);
        for (const symbol of cryptoSymbol) {
            const upper = symbol.toUpperCase();
            const price = predictionResponse[upper]?.USD;
            if (price && chartMap[upper]) {
                chartMap[upper].series.update({
                    time: now,
                    open: price,
                    high: price,
                    low: price,
                    close: price
                });
            }
        }
    }, 1000);

    const chartMap = {};
    const container = document.getElementById("liveChartsContainer");

    for (const item of cryptoItems) {
        const symbol = item.symbol.toUpperCase();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = `<h4>${symbol}</h4><div id="chart-${symbol}" style="height:300px;"></div>`;
        container.appendChild(wrapper);

        const chart = LightweightCharts.createChart(`chart-${symbol}`, {
            layout: {
                background: {color: "#ffffff"},
                textColor: "#000000",
            },
            grid: {
                vertLines: {color: "#eee"},
                horzLines: {color: "#eee"},
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const series = chart.addCandlestickSeries();
        chartMap[symbol] = {chart, series};

        const history = await fetchCandles(symbol);
        series.setData(history);
    }
}

// Fetches recent historical candlestick data for a given symbol
async function fetchCandles(symbol) {
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/histominute?fsym=${symbol}&tsym=USD&limit=5`);
    const json = await res.json();
    return json.Data.Data.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
    }));
}

// Maps array of symbols into a comma-separated string for API usage
function mapCryptoValues(arr) {
    let newStrings = ``;
    arr.map((symbol, index) => {
        if (index !== arr.length - 1) {
            newStrings += symbol + `,`;
        } else newStrings += symbol;
    });
    return newStrings;
}