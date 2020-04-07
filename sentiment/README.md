## Installation
* pip install
 * BeautifulSoup
 * gTTS
 * Afinn

To the AFINN package in directory:
`/usr/local/lib/python2.7/dist-packages/afinn/data`

Add the following file:
https://raw.githubusercontent.com/fnielsen/afinn/master/afinn/data/AFINN-sv-165.txt

And in the file `/usr/local/lib/python2.7/dist-packages/afinn/afinn.py`
Change
```
LANGUAGE_TO_FILENAME = {
    'da': 'AFINN-da-32.txt',
    'en': 'AFINN-en-165.txt',
    'emoticons': 'AFINN-emoticon-8.txt',
    }
```
To:
```
LANGUAGE_TO_FILENAME = {
    'da': 'AFINN-da-32.txt',
    'en': 'AFINN-en-165.txt',
    'sv': 'AFINN-sv-165.txt',
    'emoticons': 'AFINN-emoticon-8.txt',
    }
```

## Execution pipeline

1. Generate 2-grams from report data `python report_training.py`
 * Generates a csv file `training.csv` contining **ngram**, **mean**, **wheight**, **stdev**
2. Examine test data `jupyter notebook training_dash.ipynb`
