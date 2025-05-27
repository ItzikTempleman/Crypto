"use strict";
var PageId;
(function (PageId) {
    PageId["HOME"] = "homeScreenContainer";
    PageId["LIVE"] = "chartScreenContainer";
    PageId["ABOUT"] = "aboutScreenContainer";
})(PageId || (PageId = {}));
function getPage() {
    if (document.getElementById(PageId.HOME))
        return PageId.HOME;
    if (document.getElementById(PageId.LIVE))
        return PageId.LIVE;
    if (document.getElementById(PageId.ABOUT))
        return PageId.ABOUT;
}
(() => {
    window.addEventListener(`load`, async () => {
        const baseUrl = `https://api.coingecko.com/api/v3/coins/`;
        const cryptoExtListUsd = `markets?vs_currency=usd`;
        switch (getPage()) {
            case PageId.HOME:
                window.addEventListener('scroll', () => {
                    let background = document.querySelector('.parallaxBackground');
                    // @ts-ignore
                    background.style.transform = `translateY(${window.scrollY * 0.8}px)`;
                });
                try {
                    const cryptoList = await getCryptoCurrency(`${baseUrl}${cryptoExtListUsd}`);
                    const container = document.getElementById('cryptoListContainerDiv');
                    displayList(cryptoList, baseUrl, container);
                    searchCoin(cryptoList, baseUrl, container);
                }
                catch (err) {
                    if (err instanceof Error) {
                        console.log(err.message);
                    }
                }
                break;
            case PageId.LIVE:
                const chartContainer = document.getElementById(`chartContainer`);
                if (chartContainer) {
                    await loadChart(chartContainer);
                }
                break;
            case PageId.ABOUT:
                break;
        }
    });
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
                        }
                        else {
                            toggleCheckbox.checked = false;
                            await displayDialog(true);
                            throw new Error(`❌ You can select up to 5 coins only`);
                        }
                    }
                }
                else {
                    let currentCoins = getSavedCurrencies();
                    let newCurrencyList = [];
                    for (const item of currentCoins) {
                        if (item.id !== coin.id) {
                            newCurrencyList.push(item);
                        }
                    }
                    localStorage.setItem('coins', JSON.stringify(newCurrencyList));
                }
            }
            catch (err) {
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
            cardRoot.classList.remove(`hamburger`);
        });
        showMoreBtn?.addEventListener("click", async () => {
            if (cardRoot.classList.contains(`hamburger`))
                return;
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
                    cardRoot.classList.add(`hamburger`);
                    console.log(cardRoot.classList);
                });
            }
            catch (err) {
                throw new Error(`❌ Failed to load coin info`);
            }
            function delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        });
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
        }
        else {
            list.innerHTML = `<strong><p>No matching results</p></strong>`;
        }
        dialog.showModal();
    }
    function updateHtml(list, dialog) {
        let checkedCoins = getSavedCurrencies();
        let html = `<strong><p>You can select up to five coins. remove a coin</p></strong>`;
        checkedCoins.forEach((coin, index) => {
            html += `
        <div class="coinToDeleteDiv" id="coinToDeleteDiv-${index}">
            <i class="bi bi-trash2-fill" style="cursor:pointer" id="removeIcon-${index}"></i>
            <p><img src="${coin.image}"></p>
            <p>${coin.name}</p>
        </div>`;
        });
        list.innerHTML = html;
        checkedCoins.forEach((coin, index) => {
            const deleteCoinIcon = document.getElementById(`removeIcon-${index}`);
            deleteCoinIcon?.addEventListener(`click`, () => {
                const updatedList = checkedCoins.filter((selectedCoin) => selectedCoin.id !== coin.id);
                localStorage.setItem('coins', JSON.stringify(updatedList));
                const toggle = document.querySelector(`.toggleCheckbox[data-coin-id="${coin.id}"]`);
                if (toggle)
                    toggle.checked = false;
                if (updatedList.length < 1) {
                    dialog.close();
                }
                updateHtml(list, dialog);
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
                    if (coin.name.toUpperCase().includes(typedValue) ||
                        coin.symbol.toUpperCase().includes(typedValue) ||
                        coin.name.toLowerCase().includes(typedValue) ||
                        coin.symbol.toLowerCase().includes(typedValue)) {
                        foundCards.push(coin);
                        matchFound = true;
                    }
                }
                container.innerHTML = '';
                if (matchFound) {
                    displayList(foundCards, baseUrl, container);
                }
                else if (typedValue.length > 4) {
                    await displayDialog(false);
                }
            }
            else {
                container.innerHTML = '';
                displayList(coins, baseUrl, container);
            }
        });
    }
    async function loadChart(chartPage) {
        chartPage.style.background = `red`;
        getSavedCurrencies();
        await getDelayedData();
    }
    async function getDelayedData() {
        let arrayOfSavedCurrencies = getSavedCurrencies();
        setInterval(async () => {
            let predictionResponse = await getCryptoCurrency(`https://min-api.cryptocompare.com/data/pricemulti?tsyms=usd&fsyms=${arrayOfSavedCurrencies}`);
            console.log(predictionResponse);
        }, 1000);
    }
    function getSavedCurrencies() {
        const json = localStorage.getItem(`coins`);
        let coinsList = [];
        if (json) {
            coinsList = JSON.parse(json);
        }
        return coinsList;
    }
})();
