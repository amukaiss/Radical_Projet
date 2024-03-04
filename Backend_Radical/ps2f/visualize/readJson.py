import json
# Read the json data file
# Return a list


def read_Json(project_name):
    # Opening JSON file
    # file = open("../../../public/Data/test1_resultat.json", 'r')
    file = open("../../../public/Data/"+project_name+"_resultat.json", 'r')

    # Parse json file as a json string and
    # result: a Python dictionary.
    data = json.loads(file.read())

    # get json data length
    # print(len(data[0]["tab"]))

    # Iterating through the json list
    # for element in data[0]["tab"]:
    # print(data[0]["tab"][0])
    dataset = data[0]['tab']
    print(type(dataset))
    i = 0
    tab = []
    for value in dataset:
        # print(value[2])
        x = value[0]
        tab.append(x)
    print(tab)
    # Closing file
    file.close()
    return dataset


if __name__ == '__main__':
    file = open("../../../public/Data/test1_resultat.json", 'r')

    # Parse json file as a json string and
    # result: a Python dictionary.
    data = json.loads(file.read())

    # Iterating through the json list
    # for element in data[0]["tab"]:
    # print(data[0]["tab"][0])
    dataset = data[0]['tab']
    print(type(dataset))
    i = 0
    tabX = []
    for value in dataset:
        # print(value[2])
        x = value[2]
        tabX.append(x)
    print(max(tabX))
    # Closing file
    file.close()
