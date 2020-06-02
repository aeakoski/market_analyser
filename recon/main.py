import pandas as pd
import matplotlib.pyplot as plt
import json
import random
import numpy as np

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


def main():

    # TODO - Get larger dataset
    # TODO - Get dataset with larger ticks
    # TODO - Implement MACD

    ## Read data into df
    with open("res.txt", "r") as fd:
        prices = json.loads(fd.read())
        # print(str(len(prices)) + " datapoints")
        df = pd.read_json("res.txt")

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
    df[['date','SMA_4', 'SMA_8', 'SMA_16', "close"]].plot()
    plt.show()
    print(df.head(30))


main()
