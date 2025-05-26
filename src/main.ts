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

            cryptoList.forEach((coin: any) => {
                    let cryptoListContainerDiv = document.getElementById(`cryptoListContainerDiv`)
                    const cardRoot = document.createElement(`div`)
                    const cardFlipper = document.createElement(`div`)
                    const cardFrontFace = document.createElement(`div`)
                    const cardBackFace = document.createElement(`div`)
                    const backFaceContent = document.createElement(`div`)

                    const showMoreBtn = document.createElement(`button`)
                    showMoreBtn.className = `showMoreInfoBtn`
                    showMoreBtn.textContent = `Show more info`

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

                    buildFrontContent(cardFrontFace, coin, showMoreBtn)
                    attachFlipLogic(backFaceContent, cardRoot, coin, baseUrl, showMoreBtn)
                }
            )
        }

        function buildFrontContent(cardFrontFace: HTMLElement, coin: any, showMoreBtn: HTMLButtonElement) {

            const cryptoListItemIcon = document.createElement(`img`)
            const cryptoListItemSymbol = document.createElement(`p`)
            const cryptoListItemName = document.createElement(`p`)

            const toggleWrapper = document.createElement(`label`)
            const toggleCheckbox = document.createElement(`input`)
            const toggleVisualTrack = document.createElement(`div`)

            toggleWrapper.className = `toggleWrapper`
            toggleCheckbox.className = `toggleCheckbox`
            toggleCheckbox.type = `checkbox`
            toggleCheckbox.setAttribute(`data-coin-id`, coin.id)
            toggleVisualTrack.className = `toggleVisualTrack`
            let saved = false
            for (let savedCoin of getSavedCurrencies()) {
                if (savedCoin.id === coin.id) {
                    saved = true
                    break
                }
            }
            toggleCheckbox.checked = saved
            cryptoListItemIcon.src = coin.image
            cryptoListItemSymbol.innerHTML = coin.symbol.toUpperCase()
            cryptoListItemName.innerHTML = coin.name


            toggleCheckbox.addEventListener(`change`, async () => {
                try {
                    if (toggleCheckbox.checked) {
                        let updatedCoinsList = getSavedCurrencies()

                        let alreadyExists = false
                        for (let item of updatedCoinsList) {
                            if (item.id === coin.id) {
                                alreadyExists = true
                                break
                            }
                        }

                        if (!alreadyExists) {
                            if (updatedCoinsList.length < 5) {
                                updatedCoinsList.push(coin)
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
                            if (item.id !== coin.id) {
                                newCurrencyList.push(item)
                            }
                        }
                        localStorage.setItem('coins', JSON.stringify(newCurrencyList))
                    }
                } catch (err) {
                    if (err instanceof Error) {
                        console.log(err.message)
                    }
                }
            })
            toggleWrapper.appendChild(toggleCheckbox)
            toggleWrapper.appendChild(toggleVisualTrack)
            cardFrontFace.appendChild(toggleWrapper)
            cardFrontFace.appendChild(cryptoListItemIcon)
            cardFrontFace.appendChild(cryptoListItemSymbol)
            cardFrontFace.appendChild(cryptoListItemName)
            cardFrontFace.appendChild(showMoreBtn)
        }

        function attachFlipLogic(backFaceContent: HTMLElement, cardRoot: HTMLElement, coin: any, baseUrl: string, showMoreBtn: HTMLButtonElement) {
            const showLessInfoBtn = document.createElement(`button`)
            showLessInfoBtn.className = `showLessInfoBtn`
            showLessInfoBtn.textContent = `Show less info`
            showLessInfoBtn.addEventListener(`click`, () => {
                    cardRoot.classList.remove(`hamburger`)

                }
            )
            showMoreBtn?.addEventListener("click", async () => {
                    if (cardRoot.classList.contains(`hamburger`)) return

                    try {
                        await delay(1000)
                        const data = await getCryptoCurrency(`${baseUrl}${coin.id}`)
                        console.log(data)
                        const prices = data.market_data.current_price

                        backFaceContent.innerHTML = `
            <p><strong>${data.name}</strong></p>
            <p><strong>${formatPrices(prices.usd)} $</strong></p>
            <p><strong>${formatPrices(prices.eur)} €</strong></p>
            <p><strong>${formatPrices(prices.ils)} ₪</strong></p>
        `
                        backFaceContent.appendChild(showLessInfoBtn)

                        requestAnimationFrame(() => {
                                cardRoot.classList.add(`hamburger`)
                                console.log(cardRoot.classList)
                            }
                        )

                    } catch (err) {
                        throw new Error(`❌ Failed to load coin info`)
                    }
                function delay(ms: number): Promise<void> {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                }
            )
        }

        async function displayRemoveCoinsPopUp() {
            const dialog = document.createElement(`dialog`)
            const form = document.createElement(`form`)
            dialog.appendChild(form)
            document.body.appendChild(dialog)

            const savedCoinListDiv = document.createElement(`div`)
            savedCoinListDiv.className = `savedCoinListDiv`
            form.appendChild(savedCoinListDiv)

            const closeDialog = document.createElement(`button`)
            closeDialog.textContent = `X`
            form.appendChild(closeDialog)
            closeDialog.addEventListener(`click`, () => {
                dialog.close()
            })
            updateHtml(savedCoinListDiv, dialog)
            dialog.showModal()
        }

        function updateHtml(savedCoinListDiv: HTMLDivElement, dialog: HTMLDialogElement) {
            let checkedCoins = getSavedCurrencies()
            let html = `<strong><p>You can select up to five coins. remove a coin</p></strong>`

            checkedCoins.forEach((coin: any, index: number) => {
                    html += `
        <div class="coinToDeleteDiv" id="coinToDeleteDiv-${index}">
            <i class="bi bi-trash2-fill" style="cursor:pointer" id="removeIcon-${index}"></i>
            <p><img src="${coin.image}"></p>
            <p>${coin.name}</p>
        </div>`
                }
            )

            savedCoinListDiv.innerHTML = html

            checkedCoins.forEach((coin: any, index: number) => {
                const deleteCoinIcon = document.getElementById(`removeIcon-${index}`)
                deleteCoinIcon?.addEventListener(`click`, () => {
                    const updatedList = checkedCoins.filter((selectedCoin: any) => selectedCoin.id !== coin.id)
                    localStorage.setItem('coins', JSON.stringify(updatedList))

                    const toggle = document.querySelector(`.toggleCheckbox[data-coin-id="${coin.id}"]`) as HTMLInputElement
                    if (toggle) toggle.checked = false

                    if (updatedList.length < 1) {
                        dialog.close()
                    }
                    updateHtml(savedCoinListDiv, dialog)
                })
            })
        }


        function formatPrices(price: number): string {
            return price.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }
            )
        }

        async function loadChart(chartPage: HTMLElement) {
            chartPage.style.background = `red`
            getSavedCurrencies()
            await getDelayedData()
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