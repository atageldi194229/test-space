formdata.append("files"); // array
formdata.append("data"); // json - da

formdata.append("img1", image1);
formdata.append("img2", image2);

fileCounter = 1

let data = {
    "files": [
    {
      "type": "audio",
      "path": "/uploads/audio/qwerty.mp3"
    },
    {
      "type": "image",
      "path": "file2"
    }
  ],
    "answers": [
    {
      "key": 1,
      "type": 1 /* 1 -> text, 2 -> image || another version -``> "text" or "image" using typo enum */,
      "value": "Turkmenabat"
    },
    {
      "key": 2,
      "type": 1,
      "value": "Ashgabat"
    },
    {
      "key": 3,
      "type": 1,
      "value": "Moscow"
    },
    {
      "key": 4,
      "type": 2,
      "value": "img" /* path of file in a server */
    },
    {
      "key": 5,
      "type": 2,
      "value": "img2" /* path of file in a server */
    }
  ],
}


about price
----------------------------------------------
{
    tsc: [
        {
            ranges: {
                start: 1,
                end: 50,
            },
            price: 200,
        },
        {
            ranges: {
                start: 1,
                end: 50,
            },
            price: 200,
        },
    ],
    tcc: [
        {
            ranges: {
                start: 1,
                end: 50,
            },
            price: 200,
        },
    ],
    tscUnlimitedPrice: 100,
    tccUnlimitedPrice: 100,
}