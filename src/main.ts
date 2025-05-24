enum PageId {
    HOME = `homeScreenContainer`,
    LIVE = `chartScreenContainer`,
    ABOUT = `aboutScreenContainer`
}

function getPage() {
    if (document.getElementById(PageId.HOME)) return PageId.HOME
    if (document.getElementById(PageId.LIVE)) return PageId.LIVE
    if (document.getElementById(PageId.ABOUT)) return PageId.ABOUT
}

(() => {
        window.addEventListener(`load`, async () => {
            const baseUrl = `https://api.coingecko.com/api/v3/coins/`
            const cryptoExtListUsd: string = `markets?vs_currency=usd`
            switch (getPage()) {
                case PageId.HOME:
                    try {
                        const cryptoList = await getCryptoCurrency(`${baseUrl}${cryptoExtListUsd}`)
                        displayList(cryptoList, baseUrl)
                    } catch (err) {
                        if (err instanceof Error) {
                            console.log(err.message)
                        }
                    }
                    break
                case PageId.LIVE:
                    const chartContainer = document.getElementById(`chartContainer`)
                    if (chartContainer) {
                        await loadChart(chartContainer)
                    }
                    break
                case PageId.ABOUT:
                    break
            }
        })

        async function getCryptoCurrency(url: string) {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`❌ Failed to fetch data`)
            }
            return await response.json()
        }

        function displayList(cryptoList: any, baseUrl: string) {

            cryptoList.forEach((cryptoListItem: any) => {
                    let cryptoListContainerDiv = document.getElementById(`cryptoListContainerDiv`)
                    const cardRoot = document.createElement(`div`)
                    const cardFlipper = document.createElement(`div`)
                    const cardFrontFace = document.createElement(`div`)
                    const cardBackFace = document.createElement(`div`)
                    const backFaceContent = document.createElement(`div`)

                    cardRoot.className = `cardRoot`
                    cardFlipper.className = `cardFlipper`
                    cardFrontFace.className = `cardFrontFace`
                    cardBackFace.className = `cardBackFace`
                    backFaceContent.className = `backFaceContent`
                    cardBackFace.appendChild(backFaceContent)
                    cardFlipper.appendChild(cardFrontFace)
                    cardFlipper.appendChild(cardBackFace)
                    cardRoot.appendChild(cardFlipper)
                    if (cryptoListContainerDiv) cryptoListContainerDiv.appendChild(cardRoot)

                    buildFrontContent(cardFrontFace, cryptoListItem)
                    attachFlipLogic(cardFrontFace, backFaceContent, cardRoot, cryptoListItem, baseUrl)
                }
            )
        }

        function buildFrontContent(frontDiv: HTMLElement, cryptoListItem: any) {
            const showMoreBtn = document.createElement(`button`)
            const cryptoListItemIcon = document.createElement(`img`)
            const cryptoListItemSymbol = document.createElement(`p`)
            const cryptoListItemName = document.createElement(`p`)

            const toggleWrapper = document.createElement(`label`)
            const toggleCheckbox = document.createElement(`input`)
            const toggleVisualTrack = document.createElement(`div`)
            toggleWrapper.className = `toggleWrapper`
            toggleCheckbox.className = `toggleCheckbox`
            toggleCheckbox.type = `checkbox`

            toggleVisualTrack.className = `toggleVisualTrack`


            toggleCheckbox.checked = getSavedCurrencies().includes(cryptoListItem.symbol)

            showMoreBtn.className = `showMoreInfoBtn`
            cryptoListItemIcon.src = cryptoListItem.image
            cryptoListItemSymbol.innerHTML = cryptoListItem.symbol.toUpperCase()
            cryptoListItemName.innerHTML = cryptoListItem.name
            showMoreBtn.textContent = `Show more info`

            toggleCheckbox.addEventListener(`change`, async () => {
                    try {
                        if (toggleCheckbox.checked) {
                            let updatedCoinsList = getSavedCurrencies()
                            if (!updatedCoinsList.includes(cryptoListItem.symbol)) {
                                if (updatedCoinsList.length < 5) {
                                    updatedCoinsList.push(cryptoListItem.symbol)
                                    localStorage.setItem(`coins`, JSON.stringify(updatedCoinsList))
                                } else {
                                    toggleCheckbox.checked = false
                                    await displayRemoveCoinsPopUp()
                                    throw new Error(`❌ You can select up to 5 coins only`)

                                }
                            }
                        } else {
                            let currentCoins = getSavedCurrencies()
                            let newCurrencyList = []
                            for (const item of currentCoins) {
                                if (item !== cryptoListItem.symbol) {
                                    newCurrencyList.push(item)
                                }
                            }
                            currentCoins = newCurrencyList
                            localStorage.setItem('coins', JSON.stringify(currentCoins))
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            alert(err.message)
                        }
                    }
                }
            )
            toggleWrapper.appendChild(toggleCheckbox)
            toggleWrapper.appendChild(toggleVisualTrack)
            frontDiv.appendChild(toggleWrapper)
            frontDiv.appendChild(cryptoListItemIcon)
            frontDiv.appendChild(cryptoListItemSymbol)
            frontDiv.appendChild(cryptoListItemName)
            frontDiv.appendChild(showMoreBtn)
        }

        function attachFlipLogic(
            frontDiv: HTMLElement,
            backContent: HTMLElement,
            cardItem: HTMLElement,
            cryptoItem: any,
            baseUrl: string,
        ) {
            const showMoreBtn = frontDiv.querySelector(`.showMoreInfoBtn`)
            const showLessInfoBtn = document.createElement(`button`)
            showLessInfoBtn.className = `showLessInfoBtn`
            showLessInfoBtn.textContent = `Show less info`
            showLessInfoBtn.addEventListener(`click`, () => {
                    cardItem.classList.remove(`flipped`)
                }
            )
            showMoreBtn?.addEventListener(`click`, async () => {
                    if (cardItem.classList.contains(`flipped`)) return
                    cardItem.classList.add(`flipped`)
                    cardItem.offsetWidth
                    try {
                        const data = await getCryptoCurrency(`${baseUrl}${cryptoItem.name.toLowerCase()}`)
                        const prices = data.market_data.current_price
                        backContent.innerHTML = `
            <p>${prices.usd} $</p>
            <p>${prices.eur} €</p>
            <p>${prices.ils} ₪</p>`
                        backContent.appendChild(showLessInfoBtn)
                    } catch (err) {
                        new Error(`❌ Failed to load coin info: ${err}`)
                        cardItem.classList.remove(`flipped`)
                    }
                }
            )
        }

        async function displayRemoveCoinsPopUp() {

        }

        async function loadChart(chartPage: HTMLElement) {
            // getSavedCurrencies()
            // await getDelayedData()
        }

        async function getDelayedData() {
            let arrayOfSavedCurrencies = getSavedCurrencies()
            setInterval(async () => {
                    let predictionResponse = await getCryptoCurrency(`https://min-api.cryptocompare.com/data/pricemulti?tsyms=usd&fsyms=${arrayOfSavedCurrencies}`)
                    console.log(predictionResponse)
                }, 1000
            )
        }

        function getSavedCurrencies() {
            const json = localStorage.getItem(`coins`)
            let coinsList = []
            if (json) {
                coinsList = JSON.parse(json)
            }
            return coinsList
        }
    }
)()