"use strict";
(() => {
    window.addEventListener(`load`, async () => {
        const chartPage = document.getElementById(`chart-page`);
        if (chartPage) {
            loadChart();
        }
        try {
            const cryptoList = await getCryptoCurrencyList();
            displayList(cryptoList);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            }
        }
    });
    async function getCryptoCurrencyList() {
        const baseUrl = `https://api.coingecko.com/api/v3/coins/`;
        let cryptoExtListUsd = `markets?vs_currency=usd`;
        let url = `${baseUrl}${cryptoExtListUsd}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`❌ Failed to fetch data`);
        }
        return await response.json();
    }
    function displayList(cryptoList) {
        const listContainer = document.getElementById(`crypto-list-container`);
        cryptoList.forEach((listItem) => {
            const toggle = document.createElement(`label`);
            toggle.className = `toggle`;
            const myToggle = document.createElement(`input`);
            myToggle.className = `toggleInput`;
            myToggle.type = `checkBox`;
            const toggleDiv = document.createElement(`div`);
            toggleDiv.className = `toggleFill`;
            toggle.appendChild(myToggle);
            toggle.appendChild(toggleDiv);
            const cardItem = document.createElement(`div`);
            const symbol = document.createElement(`p`);
            const name = document.createElement(`p`);
            const icon = document.createElement(`img`);
            cardItem.appendChild(toggle);
            cardItem.className = `crypto-card-item-div`;
            symbol.className = `card-crypto-symbol`;
            name.className = `card-crypto-name`;
            icon.className = `card-crypto-icon`;
            symbol.innerHTML = `${listItem.symbol.toUpperCase()}`;
            name.innerHTML = `${listItem.name}`;
            icon.src = `${listItem.image}`;
            cardItem.appendChild(icon);
            cardItem.appendChild(symbol);
            cardItem.appendChild(name);
            const showMoreBtn = document.createElement(`button`);
            showMoreBtn.className = `showMoreInfoBtn`;
            showMoreBtn.textContent = `Show more info`;
            showMoreBtn.addEventListener(`click`, async () => {
                showMoreInfo();
            });
            cardItem.appendChild(showMoreBtn);
            if (listContainer)
                listContainer.appendChild(cardItem);
        });
    }
    function showMoreInfo() {
    }
    function loadChart() {
        console.log("in the live view screen");
    }
})();
// const chart = createChart(document.getElementById('chart') as HTMLElement, {
//     width: 800,
//     height: 500,
//     layout: {
//         background: { color: '#000000' },
//         textColor: 'white',
//     },
//     grid: {
//         vertLines: { color: '#444' },
//         horzLines: { color: '#444' },
//     },
// })
//
// // @ts-ignore
// const series = chart.addCandlestickSeries()
//
// fetch('https://min-api.cryptocompare.com/data/pricemulti?tsyms=usd&fsyms=btc,eth,doge')
//     .then(res => res.json())
//     .then(data => {
//         const candles = data.map((candle: any) => ({
//             time: candle[0] / 1000,
//             open: parseFloat(candle[1]),
//             high: parseFloat(candle[2]),
//             low: parseFloat(candle[3]),
//             close: parseFloat(candle[4])
//         }));
//         series.setData(candles)
//     })
//     .catch(err => console.error('❌ Failed to load chart data:', err))
