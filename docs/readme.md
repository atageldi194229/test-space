# Files

- question-json-models.json
- testPlatform.postman_collection.json

# !!!

tokenin wagty gutarsa hokman tazeden login bolmalydyr, onda tokenin wagty gutarandygyny nadip bilmeli

# Seeders

addSomeRows.js - diyen file - da test uchin tayyar row - lar durandyr, node bilen ishledip goybersen boldy

# About question model

question type bazada integer gornishinde saklanylyar
`type: { singleChoice: 0, multiChoice: 1, input: 2, trueFalse: 3, matching: 4, blank: 5 }`
matching - de harply key - leri sanla owrup bilersin
normal question - da correct answer lowercase bolmalydyr

### Question edit api how it works

create - daki yaly data iberyan dazhe fayllaram create - daki yaly
yone create - den 2 sany uytgeshik yeri bar, olar:

1. taze fayl goshulanda yanynda taze goshulandygyny bildiryan bir zat gorkezmeli
   - eger question - in ichindaki audio ya - da image tazelenen bolsa onda sheyle goymaly bolar:
     `question: { newAudio: true, audio: "nameOfFileInFormData", newImage: true, image: "nameOfFileInFormData", }`
   - eger answer - de taze file goshulan bolsa, onda:
     `{ key: 1, type: "image", value: "nameOfFileInFormData", new: true, }`
2. kone fayllar ochurilen bolsa olaryn path - lerini (serverdaki ugurlaryny) toplap ayratyn massiwe salyp servere ugratmaly (massiwi json - a salyp ony formdata 'deletedFiles' diyip append etsen amatly bolyar)
   ex: `["/uploads/...", "/uploads/..."]`

# how to write md file

Welcome to the test-space wiki!

# h1

## h2

### h3

[linkText](www.google.com)
**bold**
_italic_
`code`

- unorderedList
- unorderedList

1. orderedList
2. orderedList
   > BlockQuate

---

horizontal rule
