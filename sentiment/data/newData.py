import csv
# Headers; date;high;low;close;mean;vol;Oms;
# Headers; date;high;low;open;close;mean;vol;Oms;
result = []
with open('data/omxs30.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file, delimiter = ";")
    for row in csv_reader:
        del row[""]
        del row["Oms"]
        del row["vol"]
        del row["mean"]
        result.append(row)

result.sort(key = lambda x: x["date"], reverse = True)

assert len(result) > 1

for i in range(0, len(result)):
    if(i+1 < len(result)):
        result[i]["open"] = result[i+1]["close"]
    else:
        result = result[:len(result)-1] # Disregard last element in list
        break


with open("newomxs30.csv", 'w') as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=result[0].keys())
    writer.writeheader()
    for data in result:
        writer.writerow(data)


# csv_reader.sort(key=lambda x: x["Datum"], reverse=True)
