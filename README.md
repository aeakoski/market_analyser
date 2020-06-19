# market_analyser
Analyse stocks and markets


# Pipeline - How it works

Start the system in the following order:
1. Broker `node broker`
2. Server `node server`
3. Web-server viewer `cd mwweb && ng serve`
4. Fast track to simulate time `node fast-track.js`


Poloniex Public API:

2017-01-01
1483228800

2018-01-01
1514764800

-2020-01-01
1577836800

-2020-06-10
1591812972

4h = 14400s
curl "https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=1577836800&end=1591812972&period=14400" > 4h


15m = 900s
curl "https://poloniex.com/public?command=returnChartData&currencyPair=USDT_BTC&start=1577836800&end=1591812972&period=900" > 15m

USDT_BTC
