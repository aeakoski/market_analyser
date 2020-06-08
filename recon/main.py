import pandas as pd
import matplotlib.pyplot as plt
import json
import random
import numpy as np
from statsmodels.tsa.stattools import adfuller


def computeRSI (data, time_window):
    diff = data.diff(1).dropna() # diff in one field(one day)
    #this preservers dimensions off diff values
    up_chg = 0 * diff
    down_chg = 0 * diff
    # up change is equal to the positive difference, otherwise equal to zero
    up_chg[diff > 0] = diff[ diff>0 ]
    # down change is equal to negative deifference, otherwise equal to zero
    down_chg[diff < 0] = diff[ diff < 0 ]

    up_chg_avg   = up_chg.ewm(com=time_window-1 , min_periods=time_window).mean()
    down_chg_avg = down_chg.ewm(com=time_window-1 , min_periods=time_window).mean()

    rs = abs(up_chg_avg/down_chg_avg)
    rsi = 100 - 100/(1+rs)
    return rsi

def dickyFuller(df):
    X = df.values
    result = adfuller(X)
    # if result[1] < 0.05:
    #     print('ADF Statistic: %f' % result[0])
    #     print('p-value: %f' % result[1])
    #     print('Critical Values:')
    #     for key, value in result[4].items():
    #     	print('\t%s: %.3f' % (key, value))
    return {"adf": result[0], "p": result[1]}


def dickeyFullerOnSlice(df, nrOfTests):
    stationaryFindings = 0
    for i in range(nrOfTests):
        endIndex = random.randint(20, df.shape[0])
        startIndex = endIndex - 20
        intermediateDf = df[startIndex:endIndex]

        ## print(df[startIndex:endIndex])

        r = dickyFuller(intermediateDf[["close"]])
        if r["p"] < 0.01:
            stationaryFindings+=1
            print("Indexes: " + str(startIndex) + ", " + str(endIndex) + ", p: " + str(round(r["p"], 4)))
            plt.axvspan(startIndex, endIndex, color='y', alpha=0.1, lw=0)
    print("stationaryFindings: " + str(stationaryFindings) + " / " + str(nrOfTests))




def main():

    # TODO - Get larger dataset
    # TODO - Get dataset with larger ticks
    # TODO - Implement MACD

    ## Read data into df
    with open("res.txt", "r") as fd:
        prices = json.loads(fd.read())
        # print(str(len(prices)) + " datapoints")
        df = pd.read_json("res.txt")
        df.set_index("date")

    ## Add RSI Col
    df['rsi'] = computeRSI(df['close'], 14)

    # Add moving average column
    df['SMA_4'] = df["close"].rolling(window=4).mean()
    df['SMA_8'] = df["close"].rolling(window=8).mean()
    df['SMA_16'] = df["close"].rolling(window=16).mean()

    # Add EMA
    df['ewm_4'] = df['close'].ewm(com=0.25, min_periods = 4).mean()
    df['ewm_8'] = df['close'].ewm(com=0.25, min_periods = 8).mean()
    df['ewm_16'] = df['close'].ewm(com=0.25, min_periods = 16).mean()


    ## Results
    print("Nr of datapoints: " + str(df.shape[0]))

    ## printDickyFuller(df[["close"]])
    fig = plt.figure()

    dickeyFullerOnSlice(df, 300)


    ## Need to install sudo apt install libcanberra-gtk-module libcanberra-gtk3-module
    #df[['SMA_4', 'SMA_8', 'SMA_16', "close"]].plot()
    plt.plot(range(0, df['SMA_4'].shape[0]), df['SMA_4'])
    plt.plot(range(0, df['SMA_8'].shape[0]), df['SMA_8'])
    plt.plot(range(0, df['SMA_16'].shape[0]), df['SMA_16'])
    plt.plot(range(0, df['close'].shape[0]), df['close'])
    plt.show()
    ## print(df.head(10))


main()
