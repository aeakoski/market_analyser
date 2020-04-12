import csv
a = []
with open("omxs30_test_data.csv", "r") as omx_fd:
    spamreader = csv.reader(omx_fd, delimiter=';')
    for row in spamreader:
        a.append(row[:-1])

title = a[0]
body = a[1:]
title.append("open")
for i in range(0,len(body)):
    if i+1 == len(body):
        break
    body[i].append(body[i+1][3])

print(a[0:5])

with open('newomxs30_test_data.csv', 'w') as csvfile:
    spamwriter = csv.writer(csvfile)
    for i in a:
        spamwriter.writerow(i)
