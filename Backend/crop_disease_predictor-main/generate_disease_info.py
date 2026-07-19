import pickle
import json
import os

base = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(base, 'classes.pkl'), 'rb') as f:
    classes = pickle.load(f)

info = {}
for name in classes:
    if '___' in name:
        plant, disease = name.split('___', 1)
    else:
        plant, disease = name, 'Unknown'
    info[name] = {
        'plant': plant.replace('_', ' '),
        'disease': disease.replace('_', ' ')
    }

with open('disease_info.json', 'w') as f:
    json.dump(info, f, indent=2)

print(f'Created disease_info.json with {len(info)} entries')