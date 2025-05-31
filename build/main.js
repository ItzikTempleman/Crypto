"use strict";

function getSavedCurrencies() {
    const json = localStorage.getItem(`coins`);
    let coinsList = [];
    if (json) {
        coinsList = JSON.parse(json);
    }
    return coinsList;
}

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

async function getCryptoCurrency(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`❌ Failed to fetch data`);
    }
    return await response.json();
}

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
    let saved = false;
    for (let savedCoin of getSavedCurrencies()) {
        if (savedCoin.id === coin.id) {
            saved = true;
            break;
        }
    }
    toggleCheckbox.checked = saved;
    cryptoListItemIcon.src = coin.image;
    cryptoListItemSymbol.innerHTML = coin.symbol.toUpperCase();
    cryptoListItemName.innerHTML = coin.name;
    toggleCheckbox.addEventListener(`change`, async () => {
        try {
            if (toggleCheckbox.checked) {
                let updatedCoinsList = getSavedCurrencies();
                let alreadyExists = false;
                for (let item of updatedCoinsList) {
                    if (item.id === coin.id) {
                        alreadyExists = true;
                        break;
                    }
                }
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
                let newCurrencyList = [];
                for (const item of currentCoins) {
                    if (item.id !== coin.id) {
                        newCurrencyList.push(item);
                    }
                }
                localStorage.setItem('coins', JSON.stringify(newCurrencyList));
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
        }
    });
    toggleWrapper.appendChild(toggleCheckbox);
    toggleWrapper.appendChild(toggleVisualTrack);
    cardFrontFace.appendChild(toggleWrapper);
    cardFrontFace.appendChild(cryptoListItemIcon);
    cardFrontFace.appendChild(cryptoListItemSymbol);
    cardFrontFace.appendChild(cryptoListItemName);
    cardFrontFace.appendChild(showMoreBtn);
}

function attachFlipLogic(backFaceContent, cardRoot, coin, baseUrl, showMoreBtn) {
    const showLessInfoBtn = document.createElement(`button`);
    showLessInfoBtn.className = `showLessInfoBtn`;
    showLessInfoBtn.textContent = `Show less info`;
    showLessInfoBtn.addEventListener(`click`, () => {
        cardRoot.classList.remove(`customFlip`);
    });
    showMoreBtn?.addEventListener("click", async () => {
            if (cardRoot.classList.contains(`customFlip`)) return;
            try {
                await delay(600);
                const data = await getCryptoCurrency(`${baseUrl}${coin.id}`);
                console.log(data);
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
                    console.log(cardRoot.classList);
                });
            } catch (err) {
                throw new Error(`❌ Failed to load coin info`);
            }

            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        }
    );
}

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
    closeDialog.addEventListener(`click`, () => {
        dialog.close();
    });
    if (toUpdateList) {
        updateHtml(list, dialog);
    } else {
        list.innerHTML = `<strong><p>No matching results</p></strong>`;
    }
    dialog.showModal();
}

function updateHtml(list, dialog) {
    const checkedCoins = getSavedCurrencies();
    callDialog(list, checkedCoins);
    manageDeleteCoins(list, dialog);
}

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

function formatPrices(price) {
    return price.toLocaleString('en-US', {
        maximumFractionDigits: 0
    });
}

function searchCoin(coins, baseUrl, container) {
    const input = document.getElementById("searchInput");
    input?.addEventListener("input", async (event) => {
        const target = event.target;
        const typedValue = target.value.toLowerCase().trim();
        if (typedValue.length > 2) {
            let matchFound = false;
            let foundCards = [];
            for (const coin of coins) {
                if (coin.name.toUpperCase().includes(typedValue) || coin.symbol.toUpperCase().includes(typedValue) || coin.name.toLowerCase().includes(typedValue) || coin.symbol.toLowerCase().includes(typedValue)) {
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

async function loadChartScreen() {
    const cryptoItems = getSavedCurrencies()
    let cryptoSymbol = []
    cryptoItems.forEach(item => {
        cryptoSymbol.push(item.symbol);
    })

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
            }
        );
        const series = chart.addCandlestickSeries();
        chartMap[symbol] = {chart, series};

        const history = await fetchCandles(symbol);
        series.setData(history);
    }
}

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

function mapCryptoValues(arr) {
    let newStrings = ``
    arr.map((symbol, index) => {
        if (index !== arr.length - 1) {
            newStrings += symbol + `,`
        } else newStrings += symbol
    })
    return newStrings
}