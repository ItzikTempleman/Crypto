(() => {
    window.addEventListener(`load`, async () => {
        const proxy = "https://cors-anywhere.herokuapp.com/";
        const baseUrl = `https://api.coingecko.com/api/v3/coins/`;
        const cryptoListUrl = `${proxy}${baseUrl}list`;
        try {
            const cryptoList = await getCryptoCurrencyList(cryptoListUrl);
            if (!Array.isArray(cryptoList)) {
                new Error("❌ Must be an array");
            }
            const limitedList = cryptoList.slice(0, 10);
            for (let i = 0; i < 10; i++) {
                let cryptoIdName = limitedList[i].id;
                const cryptoData = await getCryptoCurrency(`${proxy}${baseUrl}`, cryptoIdName);
                displayCurrencies(cryptoData, limitedList[i]);
                await setDelay(1500);
            }
        }
        catch (err) {
            console.log(err.message);
        }
    });
    async function getCryptoCurrencyList(cryptoListUrl) {
        const response = await fetch(cryptoListUrl);
        return response.json();
    }
    async function getCryptoCurrency(baseUrl, cryptoIdName) {
        let cryptoListResponse = `${baseUrl}${cryptoIdName}`;
        const response = await fetch(cryptoListResponse);
        if (!response.ok) {
            throw new Error(`❌ ${await response.text()}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    }
    async function setDelay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
    function displayCurrencies(cryptoData, basicInfo) {
    }
})();
