enum PageId {
    HOME = "home-body-container",
    LIVE = "chart-page",
    ABOUT = "about-page"
}

function getPage(): PageId | null {
    if (document.getElementById(PageId.HOME)) return PageId.HOME
    if (document.getElementById(PageId.LIVE)) return PageId.LIVE
    if (document.getElementById(PageId.ABOUT)) return PageId.ABOUT
    return null;
}

(() => {
        window.addEventListener("load", async () => {
            switch (getPage()) {
                case PageId.HOME:
                    try {
                        const cryptoList = await getCryptoCurrencyList()
                        displayList(cryptoList)
                    } catch (err) {
                        if (err instanceof Error) {
                            console.log(err.message)
                        }
                    }
                    break

                case PageId.LIVE:
                    const chartContainer = document.getElementById("chart")
                    if (chartContainer) {
                        loadChart(chartContainer)
                    }
                    break

                case PageId.ABOUT:
                    break
            }
        })

        async function getCryptoCurrencyList() {
            const baseUrl = `https://api.coingecko.com/api/v3/coins/`
            let cryptoExtListUsd = `markets?vs_currency=usd`

            let url = `${baseUrl}${cryptoExtListUsd}`
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`❌ Failed to fetch data`)
            }
            return await response.json()
        }


        function displayList(cryptoList: any) {
            const listContainer = document.getElementById(`crypto-list-container`)

            cryptoList.forEach((listItem: { symbol: string; name: any; image: any; }) => {
                    const toggle = document.createElement(`label`)
                    toggle.className = `toggle`
                    const myToggle = document.createElement(`input`)
                    myToggle.className = `toggleInput`
                    myToggle.type = `checkBox`
                    const toggleDiv = document.createElement(`div`)
                    toggleDiv.className = `toggleFill`

                    toggle.appendChild(myToggle)
                    toggle.appendChild(toggleDiv)


                    const cardItem = document.createElement(`div`)
                    const symbol = document.createElement(`p`)
                    const name = document.createElement(`p`)
                    const icon = document.createElement(`img`)
                    cardItem.appendChild(toggle)


                    cardItem.className = `crypto-card-item-div`
                    symbol.className = `card-crypto-symbol`
                    name.className = `card-crypto-name`
                    icon.className = `card-crypto-icon`

                    symbol.innerHTML = `${listItem.symbol.toUpperCase()}`
                    name.innerHTML = `${listItem.name}`
                    icon.src = `${listItem.image}`


                    cardItem.appendChild(icon)
                    cardItem.appendChild(symbol)
                    cardItem.appendChild(name)


                    const showMoreBtn = document.createElement(`button`)
                    showMoreBtn.className = `showMoreInfoBtn`
                    showMoreBtn.textContent = `Show more info`
                    showMoreBtn.addEventListener(`click`, async () => {
                            showMoreInfo()
                        }
                    )
                    cardItem.appendChild(showMoreBtn)

                    if (listContainer)
                        listContainer.appendChild(cardItem)
                }
            )
        }

        function showMoreInfo() {

        }

        function loadChart(chartPage: HTMLElement): void {
            console.log("in the live view screen")
            chartPage.style.backgroundColor = `red`
        }
    }
)()








