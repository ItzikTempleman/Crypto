"use strict";
var PageId;
(function (PageId) {
    PageId["HOME"] = "home-body-container";
    PageId["LIVE"] = "chart-page";
    PageId["ABOUT"] = "about-page";
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
        let coinsList = getSavedCurrencies();
        switch (getPage()) {
            case PageId.HOME:
                try {
                    const cryptoList = await getCryptoCurrency(`${baseUrl}${cryptoExtListUsd}`);
                    displayList(cryptoList, coinsList, baseUrl);
                }
                catch (err) {
                    if (err instanceof Error) {
                        console.log(err.message);
                    }
                }
                break;
            case PageId.LIVE:
                const chartContainer = document.getElementById(`chart`);
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
    function displayList(cryptoList, coinsList, baseUrl) {
        let cryptoListContainerDiv = document.getElementById(`crypto-list-container`);
        cryptoList.forEach((cryptoListItem) => {
            const cardContainer = document.createElement(`div`);
            const frontContentDiv = document.createElement(`div`);
            const frontDiv = document.createElement(`div`);
            const backDiv = document.createElement(`div`);
            const backContent = document.createElement(`div`);
            cardContainer.className = `cardContainer`;
            frontContentDiv.className = `frontContentDiv`;
            frontDiv.className = `frontDiv`;
            backDiv.className = `backDiv`;
            backContent.className = `backContentDiv`;
            buildFrontContent(frontDiv, cryptoListItem, coinsList);
            backDiv.appendChild(backContent);
            attachFlipLogic(frontDiv, backContent, backDiv, cardContainer, cryptoListItem, coinsList, baseUrl);
            frontContentDiv.appendChild(frontDiv);
            frontContentDiv.appendChild(backDiv);
            cardContainer.appendChild(frontContentDiv);
            if (cryptoListContainerDiv !== null)
                cryptoListContainerDiv.appendChild(cardContainer);
        });
    }
    function buildFrontContent(front, cryptoListItem, coinsList) {
        const toggleLabel = document.createElement(`label`);
        const toggleInput = document.createElement(`input`);
        const toggleFill = document.createElement(`div`);
        const icon = document.createElement(`img`);
        const symbol = document.createElement(`p`);
        const name = document.createElement(`p`);
        const showMoreBtn = document.createElement(`button`);
        toggleLabel.className = `toggle`;
        toggleInput.className = `toggleInput`;
        toggleInput.type = `checkBox`;
        toggleFill.className = `toggleFill`;
        icon.className = `card-crypto-icon`;
        symbol.className = `card-crypto-symbol`;
        name.className = `card-crypto-name`;
        showMoreBtn.className = `showMoreInfoBtn`;
        icon.src = cryptoListItem.image;
        symbol.innerHTML = cryptoListItem.symbol.toUpperCase();
        name.innerHTML = cryptoListItem.name;
        showMoreBtn.textContent = `Show more info`;
        toggleInput.addEventListener(`change`, () => {
            const symbolStr = cryptoListItem.symbol;
            if (toggleInput.checked) {
                if (!coinsList.includes(symbolStr)) {
                    if (coinsList.length < 5) {
                        coinsList.push(symbolStr);
                        localStorage.setItem(`coins`, JSON.stringify(coinsList));
                    }
                    else
                        toggleInput.checked = false;
                }
            }
        });
        toggleLabel.appendChild(toggleInput);
        toggleLabel.appendChild(toggleFill);
        front.appendChild(toggleLabel);
        front.appendChild(icon);
        front.appendChild(symbol);
        front.appendChild(name);
        front.appendChild(showMoreBtn);
    }
    function attachFlipLogic(frontDiv, backContent, backDiv, cardItem, listItem, coinsList, baseUrl) {
        const showMoreBtn = frontDiv.querySelector(`.showMoreInfoBtn`);
        if (!showMoreBtn)
            return;
        const showLessInfoBtn = document.createElement(`button`);
        showLessInfoBtn.className = `showLessInfoBtn`;
        showLessInfoBtn.textContent = `Show less info`;
        showLessInfoBtn.addEventListener(`click`, () => {
            cardItem.classList.remove(`flipped`);
        });
        showMoreBtn.addEventListener(`click`, async () => {
            if (cardItem.classList.contains(`flipped`))
                return;
            const data = await getCryptoCurrency(`${baseUrl}${listItem.name.toLowerCase()}`);
            const prices = data.market_data.current_price;
            backContent.innerHTML = `
            <p>${prices.usd} $</p>
            <p>${prices.eur} €</p>
            <p>${prices.ils} ₪</p>
        `;
            backContent.appendChild(showLessInfoBtn);
            cardItem.classList.add(`flipped`);
        });
    }
    async function loadChart(chartPage) {
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
