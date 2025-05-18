(
    () => {
        window.addEventListener(`load`, async () => {

                try {
                    const cryptoList = await getCryptoCurrencyList()
                    displayList(cryptoList)

                } catch (err) {
                    console.log(err.message)
                }
            }
        )

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


        function displayList(cryptoList) {
            const listContainer = document.getElementById(`crypto-list-container`)

            cryptoList.forEach(listItem => {
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


                    const btn = document.createElement(`button`)
                    btn.className = `showMoreInfoBtn`
                    btn.textContent = `Show more info`
                    btn.addEventListener(`click`, async () => {
                            showMoreInfo(listItem)
                        }
                    )
                    cardItem.appendChild(btn)


                    listContainer.appendChild(cardItem)
                }
            )
        }

        function showMoreInfo(listItem) {

        }
    }
)()


