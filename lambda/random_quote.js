const { DynamoDB } = require('aws-sdk');

exports.handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const dynamo = new DynamoDB();

    if (event.httpMethod === 'GET') {
        const quotes = [
            {
                "quote": "A computer once beat me at chess, but it was no match for me at kick boxing.",
                "by": "Emo Philips"
            },
            {
                "quote": "The computer was born to solve problems that did not exist before.",
                "by": "Bill Gates"
            },
            {
                "quote": "Standards are always out of date.  That’s what makes them standards.",
                "by": "Alan Bennett"
            },
            {
                "quote": "Computers are good at following instructions, but not at reading your mind.",
                "by": "Donald Knuth"
            },
            {
                "quote": "In a room full of top software designers, if two agree on the same thing, that’s a majority.",
                "by": "Bill Curtis"
            }
        ]

        var params = {
            TableName: "Quotes"
        };
        const randomQuote = await new Promise((resolve, reject) => {
            dynamo.scan(params, (err, data) => {
                if (err) {
                    console.log("Table not found.");
                } else {
                    console.log(data);
                    data.Items.forEach(item => {
                        quotes.push({
                            quote: item.quote.S,
                            by: item.by.S
                        });
                    })
                }
                resolve(getRandomQuote(quotes));
            });
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(randomQuote)
        };
    } else if (event.httpMethod === 'POST') {
        // Save to dynamo pending
        const inputQuote = JSON.parse(event.body);
        var params = {
            Item: {
                "id": {
                    S: (new Date).getTime().toString()
                },
                "quote": {
                    S: inputQuote.quote
                },
                "by": {
                    S: inputQuote.by
                }
            },
            ReturnConsumedCapacity: "TOTAL",
            TableName: "Quotes"
        };
        const writeResponse = await new Promise((resolve, reject) => {
            dynamo.putItem(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });

        return {
            statusCode: 200,
            body: writeResponse
        };
    }
};

function getRandomQuote(quotes) {
    quotes.sort(() => Math.random() - 0.5);
    return quotes[0];
}